<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $table = 'students';
    protected $primaryKey = 'StudentID';
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $fillable = [
        'StudentNumber',
        'FirstName',
        'MiddleName',
        'LastName',
        'Suffix',
        'DateOfBirth',
        'Gender',
        'Address',
        'ContactNumber',
        'Email',
        'ProfilePicture',
        'CourseID',
        'SectionID',
        'YearLevel',
        'SchoolYearID',
        'Status',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'CourseID', 'CourseID');
    }

    public function section()
    {
        return $this->belongsTo(Section::class, 'SectionID', 'SectionID');
    }

    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class, 'SchoolYearID', 'SchoolYearID');
    }

    public function barcodes()
    {
        return $this->hasMany(StudentBarcode::class, 'StudentID', 'StudentID');
    }

    public function logs()
    {
        return $this->hasMany(StudentLog::class, 'StudentID', 'StudentID');
    }
}
