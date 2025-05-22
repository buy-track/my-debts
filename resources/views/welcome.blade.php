@php
use Illuminate\Support\Facades\Auth;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Calendar of daily observances and holidays in the United States for February 2022">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>My Debts</title>
    <link rel="stylesheet" href="{{asset('style.css')}}">
    <script src="{{asset('jalaali.min.js')}}"></script>
    <script src="{{asset('calendar.js')}}" defer></script>
</head>
<body>
<div class="calendar-container">
    <header>
        <h1>Loading Calendar...</h1>
        <p>Holidays and Daily Observances in the United States</p>
        <nav>
            @auth
                <span>Welcome, {{ Auth::user()->name }}</span>
                <form method="POST" action="{{ route('logout') }}" style="display: inline;">
                    @csrf
                    <button type="submit" class="btn-link">Logout</button>
                </form>
            @else
                <a href="{{ route('login') }}">Login</a>
                <a href="{{ route('register') }}">Register</a>
            @endauth
        </nav>
    </header>
    <!-- Calendar navigation will be inserted here by JavaScript -->
    <ul class="days-grid">
        <!-- Calendar days will be generated dynamically by JavaScript -->
    </ul>
    <footer>
        <p class="attribution">Data sourced from <a href="https://nationaldaycalendar.com/february/" target="_blank" rel="noopener">National Day Calendar</a></p>
    </footer>
</div>
</body>
</html>
