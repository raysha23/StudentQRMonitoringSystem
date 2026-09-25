<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $table = 'courses';
    protected $primaryKey = 'CourseID';
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $fillable = ['CourseCode', 'CourseName', 'Description', 'Status'];

    public function sections()
    {
        return $this->hasMany(Section::class, 'CourseID', 'CourseID');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'CourseID', 'CourseID');
    }
}
