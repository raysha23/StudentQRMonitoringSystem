<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PersonBarcode;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PersonBarcodeController extends Controller
{
    private const FORMAT = 'CODE128';
    private const WITH = ['student', 'employee'];

    public function index()
    {
        return PersonBarcode::with(self::WITH)->orderByDesc('BarcodeID')->get();
    }

    public function show(PersonBarcode $personBarcode)
    {
        return $personBarcode->load(self::WITH);
    }

    // GET /students/{student}/barcode
    public function forStudent(Student $student)
    {
        return $this->activeOrIssue('StudentID', $student->StudentID, 'STU-' . $student->StudentNumber);
    }

    // POST /students/{student}/barcode/reissue
    public function reissueForStudent(Student $student)
    {
        return response()->json(
            $this->issue('StudentID', $student->StudentID, 'STU-' . $student->StudentNumber),
            201
        );
    }

    // GET /employees/{employee}/barcode
    public function forEmployee(Employee $employee)
    {
        return $this->activeOrIssue('EmployeeID', $employee->EmployeeID, 'EMP-' . $employee->EmployeeNo);
    }

    // POST /employees/{employee}/barcode/reissue
    public function reissueForEmployee(Employee $employee)
    {
        return response()->json(
            $this->issue('EmployeeID', $employee->EmployeeID, 'EMP-' . $employee->EmployeeNo),
            201
        );
    }

    private function activeOrIssue(string $column, int $id, string $prefix): PersonBarcode
    {
        return PersonBarcode::where($column, $id)->where('Status', 'Active')->first()
            ?? $this->issue($column, $id, $prefix);
    }

    // Deactivates any current barcode, then creates a fresh one
    private function issue(string $column, int $id, string $prefix): PersonBarcode
    {
        return DB::transaction(function () use ($column, $id, $prefix) {
            PersonBarcode::where($column, $id)
                ->where('Status', 'Active')
                ->update(['Status' => 'Inactive', 'DeactivatedAt' => now()]);

            do {
                $value = $prefix . '-' . Str::upper(Str::random(6));
            } while (PersonBarcode::where('BarcodeValue', $value)->exists());

            // Only one of StudentID / EmployeeID is ever set
            return PersonBarcode::create([
                $column         => $id,
                'BarcodeValue'  => $value,
                'BarcodeFormat' => self::FORMAT,
                'Status'        => 'Active',
                'GeneratedAt'   => now(),
            ]);
        });
    }
}
