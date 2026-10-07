<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/Subject.php
class Subject extends Model
{
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $primaryKey = 'SubjectID';
    protected $fillable = ['SubjectCode', 'SubjectTitle', 'CourseID', 'Units', 'Status'];

    public function course()
    {
        return $this->belongsTo(Course::class, 'CourseID', 'CourseID');
    }
}
