<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCustom extends Model
{
    protected $table = 'users_custom';
    protected $primaryKey = 'UserID';
    public $timestamps = false;

    protected $fillable = ['Username', 'PasswordHash', 'FirstName', 'LastName', 'Status'];
}
