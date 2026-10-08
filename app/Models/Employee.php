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
        'FirstName',
        'MiddleName',
        'LastName',
        'PositionID',
        'Email',
        'Phone',
        'ProfilePicture',
        'Status',
    ];

    protected $appends = ['ProfilePictureUrl', 'FullName'];

    // "Juan S. Dela Cruz": the same format the student table uses
    public function getFullNameAttribute()
    {
        $middle = $this->MiddleName
            ? mb_substr($this->MiddleName, 0, 1) . '. '
            : '';

        return trim("{$this->FirstName} {$middle}{$this->LastName}");
    }

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


    public function barcodes()
    {
        return $this->hasMany(PersonBarcode::class, 'EmployeeID', 'EmployeeID');
    }

    public function logs()
    {
        return $this->hasMany(PersonLog::class, 'EmployeeID', 'EmployeeID');
    }
}
