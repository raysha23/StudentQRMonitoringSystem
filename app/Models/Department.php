<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/Department.php
// app/Models/Department.php
class Department extends Model
{
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $primaryKey = 'DepartmentID';
    protected $fillable = ['DepartmentCode', 'DepartmentName', 'DepartmentHead', 'Status'];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'DepartmentID', 'DepartmentID');
    }
}
