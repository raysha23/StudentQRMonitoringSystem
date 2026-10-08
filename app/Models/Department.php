<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $primaryKey = 'DepartmentID';

    protected $fillable = [
        'DepartmentCode',
        'DepartmentName',
        'DepartmentType',
        'Status',
    ];

    public function positions()
    {
        return $this->hasMany(Position::class, 'DepartmentID', 'DepartmentID');
    }
    public function courses()
    {
        return $this->hasMany(Course::class, 'DepartmentID', 'DepartmentID');
    }
}
