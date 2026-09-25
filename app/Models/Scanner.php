<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Scanner extends Model
{
    protected $table = 'scanners';
    protected $primaryKey = 'ScannerID';
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $fillable = ['ScannerName', 'DeviceName', 'Location', 'ScannerType', 'Status'];

    public function logs()
    {
        return $this->hasMany(StudentLog::class, 'ScannerID', 'ScannerID');
    }
}
