<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/Employee.php
class Employee extends Model
{
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $primaryKey = 'EmployeeID';
    protected $fillable = [
        'EmployeeNo',
        'FullName',
        'PositionID',
        'DepartmentID',
        'Email',
        'Phone',
        'ProfilePicture',
        'Status',
    ];

    protected $appends = ['ProfilePictureUrl'];

    public function getProfilePictureUrlAttribute()
    {
        if (!$this->ProfilePicture) {
            return null;
        }

        if (str_starts_with($this->ProfilePicture, 'http://') || str_starts_with($this->ProfilePicture, 'https://')) {
            return $this->ProfilePicture;
        }

        return asset('storage/' . $this->ProfilePicture);
    }
    
    public function position()
    {
        return $this->belongsTo(Position::class, 'PositionID', 'PositionID');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentID', 'DepartmentID');
    }
    public function barcodes()
    {
        return $this->hasMany(PersonBarcode::class, 'EmployeeID', 'EmployeeID');
    }

    public function logs()
    {
        return $this->hasMany(PersonLog::class, 'EmployeeID', 'EmployeeID');
    }
}
