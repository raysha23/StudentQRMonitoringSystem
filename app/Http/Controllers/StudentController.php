<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    // GET /students?page=&per_page=&search=&course_id=&year_level=&status=
    public function index(Request $request)
    {
        $request->validate([
            'per_page'   => 'nullable|integer|min:1|max:100',
            'search'     => 'nullable|string|max:100',
            'course_id'  => 'nullable|integer',
            'year_level' => 'nullable|integer',
            'status'     => 'nullable|string|max:20',
        ]);

        $query = Student::query();

        if ($request->filled('course_id')) {
            $query->where('CourseID', $request->query('course_id'));
        }

        if ($request->filled('year_level')) {
            $query->where('YearLevel', $request->query('year_level'));
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $like = '%' . addcslashes($search, '%_\\') . '%';

            $query->where(function ($w) use ($like) {
                $w->where('StudentNumber', 'like', $like)
                    ->orWhere('FirstName', 'like', $like)
                    ->orWhere('LastName', 'like', $like)
                    ->orWhere('Email', 'like', $like)
                    ->orWhereRaw("CONCAT(FirstName, ' ', LastName) like ?", [$like]);
            });
        }

        // Summary card counts: use every filter EXCEPT status,
        // so the cards still show the Enrolled / Not Enrolled split
        $counts = (clone $query)
            ->selectRaw('Status, COUNT(*) as aggregate')
            ->groupBy('Status')
            ->pluck('aggregate', 'Status');

        $total    = (int) $counts->sum();
        $enrolled = (int) ($counts['Enrolled'] ?? 0);

        if ($request->filled('status')) {
            $query->where('Status', $request->query('status'));
        }

        $paginator = $query
            ->orderByDesc('StudentID')
            ->paginate((int) $request->query('per_page', 15));

        return response()->json($paginator->toArray() + [
            'stats' => [
                'total'    => $total,
                'enrolled' => $enrolled,
                'not_enrolled' => $total - $enrolled,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'FirstName' => 'required|string|max:100',
            'MiddleName' => 'nullable|string|max:100',
            'LastName' => 'required|string|max:100',
            'Suffix' => 'nullable|string|max:20',
            'DateOfBirth' => 'nullable|date',
            'Gender' => 'nullable|string|max:20',
            'Address' => 'nullable|string|max:255',
            'ContactNumber' => 'nullable|string|max:30',
            'Email' => 'nullable|email|max:150',
            'CourseID' => 'required|integer|exists:courses,CourseID',
            'SectionID' => 'required|integer|exists:sections,SectionID',
            'YearLevel' => 'nullable|integer',
            'SchoolYearID' => 'required|integer|exists:school_years,SchoolYearID',
            'Status' => 'required|string|max:20',
            'ProfilePicture' => 'nullable|image|max:2048', // 2MB max, matches frontend check
        ]);

        if ($request->hasFile('ProfilePicture')) {
            $validated['ProfilePicture'] = $this->storeAsWebp($request->file('ProfilePicture'));
        }

        $validated['StudentNumber'] = $this->generateStudentNumber();

        $student = Student::create($validated);

        return response()->json($student, 201);
    }

    public function show(Student $student)
    {
        return $student;
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'FirstName' => 'required|string|max:100',
            'MiddleName' => 'nullable|string|max:100',
            'LastName' => 'required|string|max:100',
            'Suffix' => 'nullable|string|max:20',
            'DateOfBirth' => 'nullable|date',
            'Gender' => 'nullable|string|max:20',
            'Address' => 'nullable|string|max:255',
            'ContactNumber' => 'nullable|string|max:30',
            'Email' => 'nullable|email|max:150',
            'CourseID' => 'required|integer|exists:courses,CourseID',
            'SectionID' => [
                'required',
                'integer',
                Rule::exists('sections', 'SectionID')
                    ->where('CourseID', $request->input('CourseID')),
            ],
            'YearLevel' => 'nullable|integer',
            'SchoolYearID' => 'required|integer|exists:school_years,SchoolYearID',
            'Status' => 'required|string|max:20',
            'ProfilePicture' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('ProfilePicture')) {
            // Remove the old file so orphaned images don't pile up on disk
            if ($student->ProfilePicture) {
                Storage::disk('public')->delete($student->ProfilePicture);
            }
            $validated['ProfilePicture'] = $this->storeAsWebp($request->file('ProfilePicture'));
        }

        $student->update($validated);

        return response()->json($student);
    }

    public function destroy(Student $student)
    {
        if ($student->ProfilePicture) {
            Storage::disk('public')->delete($student->ProfilePicture);
        }

        $student->delete();

        return response()->json(['message' => 'Student deleted']);
    }
    private function generateStudentNumber()
    {
        $year = date('Y');

        // Retry loop guards against a rare race condition if two students
        // are created at the exact same moment.
        do {
            $count = Student::where('StudentNumber', 'like', $year . '-%')->count();
            $candidate = $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        } while (Student::where('StudentNumber', $candidate)->exists());

        return $candidate;
    }

    private function storeAsWebp($uploadedFile)
    {
        $filename = 'students/' . uniqid() . '.webp';

        $manager = new ImageManager(new Driver());

        $image = $manager->decode($uploadedFile)
            ->scaleDown(width: 500) // caps dimensions; a profile photo never needs to be huge
            ->encodeUsingFormat(Format::WEBP, quality: 80);

        Storage::disk('public')->put($filename, (string) $image);

        return $filename;
    }
}
