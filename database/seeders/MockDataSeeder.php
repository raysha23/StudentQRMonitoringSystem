<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MockDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('en_PH');
        $now   = now();
        $ts    = ['CreatedAt' => $now, 'UpdatedAt' => $now];

        $syId = DB::table('school_years')->value('SchoolYearID');

        // ---------- Departments ----------
        $departments = [
            ['CCS', 'College of Computer Studies',         'Teaching'],
            ['CBA', 'College of Business Administration',  'Teaching'],
            ['COE', 'College of Engineering',              'Teaching'],
            ['CAS', 'College of Arts and Sciences',        'Teaching'],
            ['REG', 'Registrar Office',                    'Non-Teaching'],
            ['SEC', 'Security Office',                     'Non-Teaching'],
            ['MNT', 'Maintenance Office',                  'Non-Teaching'],
            ['ADM', 'Administration',                      'Non-Teaching'],
            ['ITD', 'IT Department',                       'Non-Teaching'],
        ];
        foreach ($departments as [$code, $name, $type]) {
            DB::table('departments')->updateOrInsert(
                ['DepartmentCode' => $code],
                ['DepartmentName' => $name, 'DepartmentType' => $type, 'Status' => 'Active'] + $ts
            );
        }
        $dept = DB::table('departments')->pluck('DepartmentID', 'DepartmentCode');

        // ---------- Positions (per department) ----------
        $teachingPositions = ['Instructor', 'Assistant Professor', 'Professor', 'Department Head'];
        $positions = [
            'CCS' => $teachingPositions,
            'CBA' => $teachingPositions,
            'COE' => $teachingPositions,
            'CAS' => $teachingPositions,
            'REG' => ['Registrar', 'Records Clerk'],
            'SEC' => ['Security Guard', 'Security Supervisor'],
            'MNT' => ['Janitor', 'Maintenance Staff', 'Electrician'],
            'ADM' => ['Admin Staff', 'Cashier', 'HR Officer'],
            'ITD' => ['IT Staff', 'System Administrator'],
        ];
        foreach ($positions as $code => $titles) {
            foreach ($titles as $title) {
                DB::table('positions')->updateOrInsert(
                    ['PositionTitle' => $title, 'DepartmentID' => $dept[$code]],
                    ['Status' => 'Active'] + $ts
                );
            }
        }
        $positionIds = DB::table('positions')->pluck('PositionID')->all();

        // ---------- Programs (courses table) ----------
        // Existing seeded BSIT -> Engineering (Industrial Technology)
        DB::table('courses')->where('CourseCode', 'BSIT')->update(['DepartmentID' => $dept['COE']]);

        $programs = [
            ['BSCS',  'BS Computer Science',          'CCS', 'Bachelor of Science in Computer Science',          ['Software Engineering', 'Data Science']],
            ['BSIS',  'BS Information Systems',       'CCS', 'Bachelor of Science in Information Systems',       ['Business Analytics']],
            ['BSBA',  'BS Business Administration',   'CBA', 'Bachelor of Science in Business Administration',   ['Marketing', 'Financial Management', 'HR Management']],
            ['BSA',   'BS Accountancy',               'CBA', 'Bachelor of Science in Accountancy',               []],
            ['BSCE',  'BS Civil Engineering',         'COE', 'Bachelor of Science in Civil Engineering',         []],
            ['BSEE',  'BS Electrical Engineering',    'COE', 'Bachelor of Science in Electrical Engineering',    []],
            ['BSPSY', 'BS Psychology',                'CAS', 'Bachelor of Science in Psychology',                []],
            ['BSED',  'BS Secondary Education',       'CAS', 'Bachelor of Secondary Education',                  ['English', 'Mathematics', 'Science']],
        ];
        foreach ($programs as [$code, $name, $d, $desc, $majors]) {
            DB::table('courses')->updateOrInsert(
                ['CourseCode' => $code],
                [
                    'CourseName'   => $name,
                    'DepartmentID' => $dept[$d],
                    'Description'  => $desc,
                    'Majors'       => json_encode($majors),
                    'Status'       => 'Active',
                ] + $ts
            );
        }
        $courseIds = DB::table('courses')->pluck('CourseID', 'CourseCode');

        // ---------- Courses / Subjects ----------
        $subjectTitles = [
            'Introduction to the Discipline',
            'Fundamentals',
            'Applied Practice',
            'Research Methods',
            'Professional Ethics',
            'Capstone Project',
        ];
        foreach ($courseIds as $code => $courseId) {
            foreach ($subjectTitles as $i => $title) {
                DB::table('subjects')->updateOrInsert(
                    ['SubjectCode' => $code . (101 + $i)],
                    [
                        'SubjectTitle' => $title,
                        'CourseID'     => $courseId,
                        'Units'        => $faker->randomElement([2, 3, 3, 3, 4]),
                        'Status'       => 'Active',
                    ] + $ts
                );
            }
        }

        // ---------- Sections (2 per program per year level) ----------
        foreach ($courseIds as $courseId) {
            for ($year = 1; $year <= 4; $year++) {
                foreach (['Charity', 'Faith'] as $name) {
                    DB::table('sections')->updateOrInsert(
                        ['SectionName' => $name, 'CourseID' => $courseId, 'YearLevel' => $year],
                        ['SchoolYearID' => $syId, 'Status' => 'Active'] + $ts
                    );
                }
            }
        }
        $sections = DB::table('sections')->get(['SectionID', 'CourseID', 'YearLevel']);

        // ---------- Students (400) ----------
        $students = [];
        for ($i = 1; $i <= 400; $i++) {
            $gender  = $faker->randomElement(['Male', 'Female']);
            $section = $sections->random();
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
                'CourseID'       => $section->CourseID,
                'SectionID'      => $section->SectionID,
                'YearLevel'      => $section->YearLevel,
                'SchoolYearID'   => $syId,
                'Status'         => $faker->randomElement(['Enrolled', 'Enrolled', 'Enrolled', 'Not Enrolled']),
            ] + $ts;
        }
        foreach (array_chunk($students, 100) as $chunk) {
            DB::table('students')->insert($chunk);
        }

        // ---------- Employees (150) ----------
        $employees = [];
        for ($i = 1; $i <= 150; $i++) {
            $gender = $faker->randomElement(['male', 'female']);
            $employees[] = [
                'EmployeeNo'     => 'EMP-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'FirstName'      => $faker->firstName($gender),
                'MiddleName'     => $faker->lastName(),
                'LastName'       => $faker->lastName(),
                'PositionID'     => $faker->randomElement($positionIds),
                'Email'          => "employee{$i}@example.com",
                'Phone'          => '09' . $faker->numerify('#########'),
                'ProfilePicture' => null,
                'Status'         => $faker->randomElement(['Active', 'Active', 'Active', 'Inactive']),
            ] + $ts;
        }
        foreach (array_chunk($employees, 75) as $chunk) {
            DB::table('employees')->insert($chunk);
        }

        $this->command?->info(
            'Seeded ' . DB::table('students')->count() . ' students, '
                . DB::table('employees')->count() . ' employees'
        );
    }
}
