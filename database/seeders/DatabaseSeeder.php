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
            'Username' => 'admin',
            'PasswordHash' => bcrypt('admin123'),
            'FirstName' => 'Admin',
            'LastName' => 'Gwapo',
            'Status' => 'Active',
        ]);

        $courses = collect([
            ['CourseCode' => 'BSIT', 'CourseName' => 'BS Industrial Technology', 'Status' => 'Active'],
        ])->map(fn($c) => Course::create($c));

        $schoolYear = SchoolYear::create([
            'SchoolYearName' => '2025-2026',
            'StartDate' => '2025-08-01',
            'EndDate' => '2026-05-31',
            'Status' => 'Active',
        ]);

        $sections = collect([
            ['SectionName' => 'Charity', 'CourseID' => $courses[0]->CourseID, 'YearLevel' => 1],
        ])->map(fn($s) => Section::create($s + [
            'SchoolYearID' => $schoolYear->SchoolYearID,
            'Status' => 'Active',
        ]));

        Scanner::create([
            'ScannerName' => 'Main Gate Scanner',
            'DeviceName' => 'ESP32-CAM-01',
            'Location' => 'Main Entrance',
            'ScannerType' => 'Barcode',
            'Status' => 'Active',
        ]);

        $this->call(MockDataSeeder::class);
    }
}
