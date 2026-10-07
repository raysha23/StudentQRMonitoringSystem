<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonBarcode extends Model
{
    protected $table = 'person_barcodes';
    protected $primaryKey = 'BarcodeID';
    public $timestamps = false;

    protected $fillable = [
        'StudentID',
        'EmployeeID',
        'BarcodeValue',
        'BarcodeFormat',
        'Status',
        'GeneratedAt',
        'DeactivatedAt',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'StudentID', 'StudentID');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'EmployeeID', 'EmployeeID');
    }
}
