<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentLog extends Model
{
    protected $table = 'student_logs';
    protected $primaryKey = 'LogID';
    public $timestamps = false; // uses ScannedAt instead

    protected $fillable = ['StudentID', 'BarcodeID', 'LogType', 'ScannedAt', 'ScannerID', 'Remarks'];

    public function student()
    {
        return $this->belongsTo(Student::class, 'StudentID', 'StudentID');
    }

    public function barcode()
    {
        return $this->belongsTo(StudentBarcode::class, 'BarcodeID', 'BarcodeID');
    }

    public function scanner()
    {
        return $this->belongsTo(Scanner::class, 'ScannerID', 'ScannerID');
    }
}
