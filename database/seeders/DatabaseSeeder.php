<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Scanner;
use App\Models\Student;
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

        collect([
            ['StudentNumber' => '2025-0001', 'FirstName' => 'Juan', 'LastName' => 'Dela Cruz', 'i' => 0, 'Phone' => '09171234567'],
            ['StudentNumber' => '2025-0002', 'FirstName' => 'Maria', 'LastName' => 'Santos', 'i' => 1, 'Phone' => '09182345678'],
            ['StudentNumber' => '2025-0003', 'FirstName' => 'Pedro', 'LastName' => 'Reyes', 'i' => 2, 'Phone' => '09193456789'],
            ['StudentNumber' => '2025-0004', 'FirstName' => 'Ana', 'LastName' => 'Garcia', 'i' => 3, 'Phone' => '09204567890'],
            ['StudentNumber' => '2025-0005', 'FirstName' => 'Jose', 'LastName' => 'Lopez', 'i' => 4, 'Phone' => '09215678901'],
        ])->each(function ($s) use ($courses, $sections, $schoolYear) {
            Student::create([
                'StudentNumber' => $s['StudentNumber'],
                'FirstName' => $s['FirstName'],
                'LastName' => $s['LastName'],
                'ContactNumber' => $s['Phone'], // 👈 new
                'ProfilePicture' => "https://api.dicebear.com/9.x/initials/svg?seed={$s['FirstName']}-{$s['LastName']}",
                'CourseID' => $courses[$s['i']]->CourseID,
                'SectionID' => $sections[$s['i']]->SectionID,
                'YearLevel' => $sections[$s['i']]->YearLevel,
                'SchoolYearID' => $schoolYear->SchoolYearID,
                'Status' => 'Enrolled',
            ]);
        });
    }
}
