<?php

namespace App\Http\Controllers;

use Hekmatinasser\Verta\Facades\Verta;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Show the welcome page.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        $jNow = Verta::now();
        $start = $jNow->clone()->startMonth();
        $end = $jNow->clone()->endMonth();
        $days_j = collect();
        for (; $start->lessThanOrEqualTo($end) ; $start->addDay()) {
             $days_j->push([
                 "date"         => $start->toCarbon()->toDateString(),
                 "date-j"       => $start->formatDate(),
                 "today"        => $start->isToday(),
                 "datetime"     => $start->toCarbon()->toDateTimeString(),
                 "datetime-j"   => $start->formatDatetime(),
             ]);
        }

        $data = [
            "date"      => $jNow->toCarbon()->toDateString(),
            "date-j"    => $jNow->formatDate(),
            "timezone"  => Verta::getTimezone()->getName(),
            "days"      => $days_j,
        ];
        return view('welcome',$data);
    }
}
