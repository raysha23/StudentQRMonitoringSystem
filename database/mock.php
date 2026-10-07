<?php

use Illuminate\Support\Facades\DB;

$faker = \Faker\Factory::create('en_PH');
$now   = now();

// ---------- Lookups from your existing seeder ----------
$courseId  = DB::table('courses')->value('CourseID');
$sectionId = DB::table('sections')->value('SectionID');
$syId      = DB::table('school_years')->value('SchoolYearID');

// ---------- Departments ----------
if (DB::table('departments')->count() === 0) {
    $departments = [
        ['IT',    'IT Department'],
        ['REG',   'Registrar Office'],
        ['SEC',   'Security'],
        ['MNT',   'Maintenance'],
        ['ADMIN', 'Administration'],
    ];
    foreach ($departments as [$code, $name]) {
        DB::table('departments')->insert([
            'DepartmentCode' => $code,
            'DepartmentName' => $name,
            'DepartmentHead' => null,
            'Status'         => 'Active',
            'CreatedAt'      => $now,
            'UpdatedAt'      => $now,
        ]);
    }
}

// ---------- Positions ----------
if (DB::table('positions')->count() === 0) {
    $positions = [
        ['Instructor',  'Teaching'],
        ['Professor',   'Teaching'],
        ['Dean',        'Teaching'],
        ['Registrar',   'Non-Teaching'],
        ['Guard',       'Non-Teaching'],
        ['Janitor',     'Non-Teaching'],
        ['Admin Staff', 'Non-Teaching'],
    ];
    foreach ($positions as [$title, $type]) {
        DB::table('positions')->insert([
            'PositionTitle' => $title,
            'PositionType'  => $type,
            'Status'        => 'Active',
            'CreatedAt'     => $now,
            'UpdatedAt'     => $now,
        ]);
    }
}

$positionIds   = DB::table('positions')->pluck('PositionID')->all();
$departmentIds = DB::table('departments')->pluck('DepartmentID')->all();

// ---------- 100 Students ----------
$students = [];
for ($i = 1; $i <= 100; $i++) {
    $gender = $faker->randomElement(['Male', 'Female']);
    $students[] = [
        'StudentNumber'  => '2025-' . str_pad($i, 5, '0', STR_PAD_LEFT),
        'FirstName'      => $faker->firstName(strtolower($gender)),
        'MiddleName'     => $faker->lastName(),
        'LastName'       => $faker->lastName(),
        'Suffix'         => $faker->boolean(5) ? 'Jr.' : null,
        'DateOfBirth'    => $faker->dateTimeBetween('-24 years', '-17 years')->format('Y-m-d'),
        'Gender'         => $gender,
        'Address'        => $faker->address(),
        'ContactNumber'  => '09' . $faker->numerify('#########'),
        'Email'          => "student{$i}@example.com",
        'ProfilePicture' => null,
        'CourseID'       => $courseId,
        'SectionID'      => $sectionId,
        'YearLevel'      => 1,
        'SchoolYearID'   => $syId,
        'Status'         => $faker->randomElement(['Enrolled', 'Enrolled', 'Enrolled', 'Not Enrolled']),
        'CreatedAt'      => $now,
        'UpdatedAt'      => $now,
    ];
}
DB::table('students')->insert($students);

// ---------- 100 Employees ----------
$employees = [];
for ($i = 1; $i <= 100; $i++) {
    $employees[] = [
        'EmployeeNo'     => 'EMP-' . str_pad($i, 3, '0', STR_PAD_LEFT),
        'FullName'       => $faker->name(),
        'PositionID'     => $faker->randomElement($positionIds),
        'DepartmentID'   => $faker->randomElement($departmentIds),
        'Email'          => "employee{$i}@example.com",
        'Phone'          => '09' . $faker->numerify('#########'),
        'ProfilePicture' => null,
        'Status'         => $faker->randomElement(['Active', 'Active', 'Active', 'Inactive']),
        'CreatedAt'      => $now,
        'UpdatedAt'      => $now,
    ];
}
DB::table('employees')->insert($employees);

echo "Done: " . DB::table('students')->count() . " students, "
    . DB::table('employees')->count() . " employees\n";
