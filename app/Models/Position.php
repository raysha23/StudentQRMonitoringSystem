<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/Position.php
class Position extends Model
{
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $primaryKey = 'PositionID';
    protected $fillable = ['PositionTitle', 'PositionType', 'Status'];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'PositionID', 'PositionID');
    }
}
