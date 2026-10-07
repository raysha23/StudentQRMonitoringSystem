<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonLog extends Model
{
    protected $table = 'person_logs';
    protected $primaryKey = 'LogID';
    public $timestamps = false;

    protected $fillable = [
        'StudentID',
        'EmployeeID',
        'BarcodeID',
        'LogType',
        'ScannedAt',
        'ScannerID',
        'Remarks',
    ];
    protected $appends = ['PersonType'];

    public function getPersonTypeAttribute()
    {
        return $this->StudentID ? 'Student' : 'Employee';
    }
    

    public function student()
    {
        return $this->belongsTo(Student::class, 'StudentID', 'StudentID');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'EmployeeID', 'EmployeeID');
    }

    public function barcode()
    {
        return $this->belongsTo(PersonBarcode::class, 'BarcodeID', 'BarcodeID');
    }

    public function scanner()
    {
        return $this->belongsTo(Scanner::class, 'ScannerID', 'ScannerID');
    }
}
