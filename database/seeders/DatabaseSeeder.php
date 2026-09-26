<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Scanner;
use App\Models\Student;
use App\Models\StudentBarcode;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::create([
            'Username' => 'testuser',
            'PasswordHash' => bcrypt('password'),
            'FirstName' => 'Test',
            'LastName' => 'User',
            'Status' => 'Active',
        ]);

        $courses = collect([
            ['CourseCode' => 'BSIT', 'CourseName' => 'BS Information Technology', 'Status' => 'Active'],
            ['CourseCode' => 'BSCS', 'CourseName' => 'BS Computer Science', 'Status' => 'Active'],
            ['CourseCode' => 'BSED', 'CourseName' => 'BS Education', 'Status' => 'Active'],
            ['CourseCode' => 'BSBA', 'CourseName' => 'BS Business Administration', 'Status' => 'Active'],
            ['CourseCode' => 'BSA', 'CourseName' => 'BS Accountancy', 'Status' => 'Active'],
        ])->map(fn($c) => Course::create($c));

        $schoolYear = SchoolYear::create([
            'SchoolYearName' => '2025-2026',
            'StartDate' => '2025-08-01',
            'EndDate' => '2026-05-31',
            'Status' => 'Active',
        ]);

        $sections = collect([
            ['SectionName' => 'IT-1A', 'CourseID' => $courses[0]->CourseID, 'YearLevel' => 1, 'Adviser' => 'Prof. Santos'],
            ['SectionName' => 'CS-1A', 'CourseID' => $courses[1]->CourseID, 'YearLevel' => 1, 'Adviser' => 'Prof. Reyes'],
            ['SectionName' => 'ED-2A', 'CourseID' => $courses[2]->CourseID, 'YearLevel' => 2, 'Adviser' => 'Prof. Cruz'],
            ['SectionName' => 'BA-1A', 'CourseID' => $courses[3]->CourseID, 'YearLevel' => 1, 'Adviser' => 'Prof. Garcia'],
            ['SectionName' => 'ACC-3A', 'CourseID' => $courses[4]->CourseID, 'YearLevel' => 3, 'Adviser' => 'Prof. Lopez'],
        ])->map(fn($s) => Section::create($s + [
            'SchoolYearID' => $schoolYear->SchoolYearID,
            'Status' => 'Active',
        ]));

        Scanner::create([
            'ScannerName' => 'Main Gate Scanner',
            'DeviceName' => 'ESP32-CAM-01',
            'Location' => 'Main Entrance',
            'ScannerType' => 'QR',
            'Status' => 'Active',
        ]);

        Student::factory()
            ->count(100)
            ->create()
            ->each(fn($student) => StudentBarcode::generateFor($student));
    }
}
