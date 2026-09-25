<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $table = 'sections';
    protected $primaryKey = 'SectionID';
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $fillable = ['SectionName', 'CourseID', 'YearLevel', 'SchoolYearID', 'Adviser', 'Status'];

    public function course()
    {
        return $this->belongsTo(Course::class, 'CourseID', 'CourseID');
    }

    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class, 'SchoolYearID', 'SchoolYearID');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'SectionID', 'SectionID');
    }
}
