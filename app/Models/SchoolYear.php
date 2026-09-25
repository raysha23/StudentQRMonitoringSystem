<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolYear extends Model
{
    protected $table = 'school_years';
    protected $primaryKey = 'SchoolYearID';
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $fillable = ['SchoolYearName', 'StartDate', 'EndDate', 'Status'];

    public function sections()
    {
        return $this->hasMany(Section::class, 'SchoolYearID', 'SchoolYearID');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'SchoolYearID', 'SchoolYearID');
    }
}
