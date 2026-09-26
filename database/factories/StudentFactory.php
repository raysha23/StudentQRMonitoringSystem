<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Section;
use App\Models\SchoolYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected static int $sequence = 1;

    public function definition(): array
    {
        $course = Course::inRandomOrder()->first();
        $section = Section::where('CourseID', $course->CourseID)
            ->inRandomOrder()
            ->first() ?? Section::inRandomOrder()->first();
        $schoolYear = SchoolYear::inRandomOrder()->first();

        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();

        return [
            'StudentNumber'  => sprintf('%s-%04d', date('Y'), self::$sequence++),
            'FirstName'      => $firstName,
            'MiddleName'     => $this->faker->optional(0.6)->lastName(),
            'LastName'       => $lastName,
            'Suffix'         => $this->faker->optional(0.05)->randomElement(['Jr.', 'Sr.', 'II', 'III']),
            'DateOfBirth'    => $this->faker->dateTimeBetween('-24 years', '-17 years')->format('Y-m-d'),
            'Gender'         => $this->faker->randomElement(['Male', 'Female']),
            'Address'        => $this->faker->address(),
            'ContactNumber'  => '09' . $this->faker->numerify('#########'),
            'Email'          => $this->faker->unique()->safeEmail(),
            'ProfilePicture' => "https://api.dicebear.com/9.x/initials/svg?seed={$firstName}-{$lastName}",
            'CourseID'       => $course->CourseID,
            'SectionID'      => $section->SectionID,
            'YearLevel'      => $section->YearLevel ?? $this->faker->numberBetween(1, 4),
            'SchoolYearID'   => $schoolYear->SchoolYearID,
            'Status'         => $this->faker->randomElement(['Enrolled', 'Enrolled', 'Enrolled', 'Not Enrolled']),
        ];
    }
}
