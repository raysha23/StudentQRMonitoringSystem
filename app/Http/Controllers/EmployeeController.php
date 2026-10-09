<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

class EmployeeController extends Controller
{
    private const WITH = [
        'position:PositionID,PositionTitle,DepartmentID',
        'position.department:DepartmentID,DepartmentName,DepartmentType',
    ];

    public function index(Request $request)
    {
        // Default to Active; ?status=Inactive or ?status=All overrides
        $status = $request->query('status', 'Active');

        $query = Employee::with(self::WITH)->orderBy('EmployeeID', 'desc');

        if (in_array($status, ['Active', 'Inactive'], true)) {
            $query->where('Status', $status);
        }

        return $query->get();
    }

    public function counts()
    {
        return response()->json([
            'total'    => Employee::count(),
            'active'   => Employee::where('Status', 'Active')->count(),
            'inactive' => Employee::where('Status', 'Inactive')->count(),
            'faculty'  => Employee::where('Status', 'Active')
                ->whereHas('position.department', fn($q) => $q->where('DepartmentType', 'Teaching'))
                ->count(),
        ]);
    }
    
    public function restore(Employee $employee)
    {
        $employee->update(['Status' => 'Active']);

        return response()->json($employee->load(self::WITH));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'FirstName'  => 'required|string|max:100',
            'MiddleName' => 'nullable|string|max:100',
            'LastName'   => 'required|string|max:100',
            'PositionID'     => 'required|integer|exists:positions,PositionID',
            'Email'          => 'required|email|max:150|unique:employees,Email',
            'Phone'          => 'nullable|string|max:20',
            'Status'         => 'nullable|in:Active,Inactive',
            'ProfilePicture' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('ProfilePicture')) {
            $validated['ProfilePicture'] = $this->storeAsWebp($request->file('ProfilePicture'));
        }

        $validated['EmployeeNo'] = $this->generateEmployeeNumber();
        $validated['Status'] ??= 'Active';

        $employee = Employee::create($validated);

        return response()->json($employee->load(self::WITH), 201);
    }

    public function show(Employee $employee)
    {
        return $employee->load(self::WITH);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'FirstName'  => 'required|string|max:100',
            'MiddleName' => 'nullable|string|max:100',
            'LastName'   => 'required|string|max:100',
            'PositionID'     => 'sometimes|required|integer|exists:positions,PositionID',
            'Email'          => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('employees', 'Email')
                    ->ignore($employee->EmployeeID, 'EmployeeID')
            ],
            'Phone'          => 'nullable|string|max:20',
            'Status'         => 'sometimes|in:Active,Inactive',
            'ProfilePicture' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('ProfilePicture')) {
            // Remove the old file so orphaned images don't pile up
            if ($employee->ProfilePicture) {
                Storage::disk('public')->delete($employee->ProfilePicture);
            }
            $validated['ProfilePicture'] = $this->storeAsWebp($request->file('ProfilePicture'));
        } else {
            // No new file sent: keep the existing picture
            unset($validated['ProfilePicture']);
        }

        $employee->update($validated);

        return response()->json($employee->load(self::WITH));
    }

    public function destroy(Employee $employee)
    {
        $employee->update(['Status' => 'Inactive']);

        return response()->json(['message' => 'Employee set to Inactive']);
    }
    private function generateEmployeeNumber(): string
    {
        // Based on the highest existing number, so deletes never cause a collision
        $max = Employee::where('EmployeeNo', 'like', 'EMP-%')
            ->pluck('EmployeeNo')
            ->map(fn($no) => (int) substr($no, 4))
            ->max() ?? 0;

        return 'EMP-' . str_pad($max + 1, 4, '0', STR_PAD_LEFT);
    }

    private function storeAsWebp($uploadedFile): string
    {
        $filename = 'employees/' . uniqid() . '.webp';

        $manager = new ImageManager(new Driver());

        $image = $manager->decode($uploadedFile)
            ->scaleDown(width: 500)
            ->encodeUsingFormat(Format::WEBP, quality: 80);

        Storage::disk('public')->put($filename, (string) $image);

        return $filename;
    }
}
