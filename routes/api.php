<?php

use App\Http\Controllers\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::group(["middleware" => ["web","auth"]],function (){
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Task routes
    Route::get('/tasks', [TaskController::class, 'getAllTasks']); // Now supports date range filtering with start_date and end_date parameters
    Route::get('/tasks/by-date', [TaskController::class, 'getTasksByDate']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
});
