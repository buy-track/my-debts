<?php

namespace App\Traits;

use Hekmatinasser\Verta\Verta;

trait JalaliDateTrait
{
    /**
     * Get the date attribute in Jalali format.
     *
     * @param string $value
     * @return string
     */
    public function getJalaliDateAttribute($value)
    {
        if (!$this->date) {
            return null;
        }
        return Verta::instance($this->date)->format('Y-n-j');
    }

    /**
     * Get the formatted Jalali date attribute.
     *
     * @param string $value
     * @return string
     */
    public function getFormattedJalaliDateAttribute($value)
    {
        if (!$this->date) {
            return null;
        }
        return Verta::instance($this->date)->format('%B %d، %Y');
    }
}