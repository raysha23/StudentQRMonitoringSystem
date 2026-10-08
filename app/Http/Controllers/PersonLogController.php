<?php

namespace App\Http\Controllers;

use App\Models\PersonBarcode;
use App\Models\PersonLog;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PersonLogController extends Controller
{
    // Lean set: only what the scan card and Recent Scans list display
    private const WITH = [
        'student.course',
        'student.section',
        'employee.position.department',
    ];

    // The report table also shows the school year
    private const REPORT_WITH = [
        'student.course',
        'student.section',
        'student.schoolYear',
        'employee.position.department',
    ];

    // GET /person-logs?from=&to=&page=&per_page=&search=&person_type=&log_type=
    //     &course_id=&section_id=&school_year_id=&department_id=&position_id=
    public function index(Request $request)
    {
        $query = $this->filtered($request);

        // Counts for the summary cards, using the same filters (before pagination)
        $counts = (clone $query)
            ->selectRaw('LogType, COUNT(*) as aggregate')
            ->groupBy('LogType')
            ->pluck('aggregate', 'LogType');

        $paginator = $query
            ->with(self::REPORT_WITH)
            ->orderByDesc('ScannedAt')
            ->orderByDesc('LogID')
            ->paginate((int) $request->query('per_page', 15));

        return response()->json($paginator->toArray() + [
            'stats' => [
                'total'    => (int) $counts->sum(),
                'time_in'  => (int) ($counts['TIME IN'] ?? 0),
                'time_out' => (int) ($counts['TIME OUT'] ?? 0),
            ],
        ]);
    }

    // GET /person-logs/export (same filters, no pagination)
    public function export(Request $request)
    {
        return $this->filtered($request)
            ->with(self::REPORT_WITH)
            ->orderByDesc('ScannedAt')
            ->orderByDesc('LogID')
            ->get();
    }

    // Builds the filtered query shared by index() and export()
    private function filtered(Request $request)
    {
        $request->validate([
            'from'           => 'nullable|date',
            'to'             => 'nullable|date|after_or_equal:from',
            'per_page'       => 'nullable|integer|min:1|max:100',
            'person_type'    => 'nullable|in:Student,Employee',
            'log_type'       => 'nullable|in:TIME IN,TIME OUT',
            'course_id'      => 'nullable|integer',
            'section_id'     => 'nullable|integer',
            'school_year_id' => 'nullable|integer',
            'department_id'  => 'nullable|integer',
            'position_id'    => 'nullable|integer',
            'search'         => 'nullable|string|max:100',
        ]);

        $from = $request->query('from', today()->toDateString());
        $to   = $request->query('to', $from);

        // Range on the raw column so the ScannedAt index is used
        $query = PersonLog::query()
            ->where('ScannedAt', '>=', Carbon::parse($from)->startOfDay())
            ->where('ScannedAt', '<=', Carbon::parse($to)->endOfDay());

        if ($request->query('person_type') === 'Student') {
            $query->whereNotNull('StudentID');
        } elseif ($request->query('person_type') === 'Employee') {
            $query->whereNotNull('EmployeeID');
        }

        if ($request->filled('log_type')) {
            $query->where('LogType', $request->query('log_type'));
        }

        $studentFilters = array_filter([
            'CourseID'     => $request->query('course_id'),
            'SectionID'    => $request->query('section_id'),
            'SchoolYearID' => $request->query('school_year_id'),
        ]);
        if ($studentFilters) {
            $query->whereHas('student', fn($s) => $s->where($studentFilters));
        }

        if ($request->filled('position_id') || $request->filled('department_id')) {
            $query->whereHas('employee', function ($e) use ($request) {
                if ($request->filled('position_id')) {
                    $e->where('PositionID', $request->query('position_id'));
                }
                if ($request->filled('department_id')) {
                    $e->whereHas(
                        'position',
                        fn($p) => $p->where('DepartmentID', $request->query('department_id'))
                    );
                }
            });
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $like = '%' . addcslashes($search, '%_\\') . '%';

            $query->where(function ($w) use ($like, $search) {
                $w->whereHas('student', fn($s) => $s->where(
                    fn($x) => $x->where('StudentNumber', 'like', $like)
                        ->orWhere('FirstName', 'like', $like)
                        ->orWhere('LastName', 'like', $like)
                        ->orWhereRaw("CONCAT(FirstName, ' ', LastName) like ?", [$like])
                ))
                    ->orWhereHas('employee', fn($e) => $e->where(
                        fn($x) => $x->where('EmployeeNo', 'like', $like)
                            ->orWhere('FullName', 'like', $like)
                    ))
                    ->when(ctype_digit($search), fn($w) => $w->orWhere('LogID', (int) $search));
            });
        }

        return $query;
    }

    // GET /person-logs/today
    public function today()
    {
        return PersonLog::with(self::WITH)
            ->where('ScannedAt', '>=', today())
            ->orderByDesc('ScannedAt')
            ->limit(20) // keeps the sidebar feed light on busy days
            ->get();
    }

    // POST /scan
    public function scan(Request $request)
    {
        $data = $request->validate([
            'BarcodeValue' => 'required|string|max:255',
            'ScannerID'    => 'required|integer|exists:scanners,ScannerID',
        ]);

        $barcode = PersonBarcode::where('BarcodeValue', $data['BarcodeValue'])
            ->where('Status', 'Active')
            ->first();

        if (!$barcode) {
            return response()->json(['message' => 'Barcode not recognized or inactive.'], 404);
        }

        $personKey = $barcode->StudentID
            ? ['StudentID' => $barcode->StudentID]
            : ['EmployeeID' => $barcode->EmployeeID];

        // Uses the (StudentID|EmployeeID, ScannedAt) composite indexes
        $lastLog = PersonLog::where($personKey)
            ->where('ScannedAt', '>=', today())
            ->orderByDesc('ScannedAt')
            ->orderByDesc('LogID')
            ->first(['LogID', 'LogType']); // only the columns we need

        $logType = (!$lastLog || $lastLog->LogType === 'TIME OUT') ? 'TIME IN' : 'TIME OUT';

        $log = PersonLog::create($personKey + [
            'BarcodeID' => $barcode->BarcodeID,
            'LogType'   => $logType,
            'ScannedAt' => now(),
            'ScannerID' => $data['ScannerID'],
        ]);

        return response()->json([
            'message' => $logType . ' recorded.',
            'log'     => $log->load(self::WITH),
        ], 201);
    }

    public function show(PersonLog $personLog)
    {
        return $personLog->load(self::WITH);
    }

    public function destroy(PersonLog $personLog)
    {
        $personLog->delete();

        return response()->noContent();
    }
}
