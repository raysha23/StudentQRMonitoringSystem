<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PersonBarcode;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class PersonBarcodeController extends Controller
{
    private const FORMAT = 'CODE128';
    private const WITH = ['student', 'employee'];

    // No 0, O, 1, I so codes are easy to read and type by hand
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    private const CODE_LENGTH = 6;

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
        return $this->activeOrIssue('StudentID', $student->StudentID, 'STU');
    }

    // POST /students/{student}/barcode/reissue
    public function reissueForStudent(Student $student)
    {
        return response()->json(
            $this->issue('StudentID', $student->StudentID, 'STU'),
            201
        );
    }

    // GET /employees/{employee}/barcode
    public function forEmployee(Employee $employee)
    {
        return $this->activeOrIssue('EmployeeID', $employee->EmployeeID, 'EMP');
    }

    // POST /employees/{employee}/barcode/reissue
    public function reissueForEmployee(Employee $employee)
    {
        return response()->json(
            $this->issue('EmployeeID', $employee->EmployeeID, 'EMP'),
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
                $value = $prefix . '-' . $this->randomCode(self::CODE_LENGTH);
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

    private function randomCode(int $length): string
    {
        $max  = strlen(self::ALPHABET) - 1;
        $code = '';

        for ($i = 0; $i < $length; $i++) {
            $code .= self::ALPHABET[random_int(0, $max)];
        }

        return $code;
    }
}
