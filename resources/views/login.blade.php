<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login</title>
    <link rel="stylesheet" href="{{asset('style.css')}}">
    <link rel="stylesheet" href="{{asset('auth.css')}}">
</head>
<body>
<div class="calendar-container">
    <header>
        <h1>Login</h1>
        <p>Access your account</p>
    </header>
    <form method="POST" action="{{ route('login') }}">
        @csrf
        
        @if ($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
        @endif
        
        <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" required>
        </div>
        <button type="submit" class="btn">Login</button>
    </form>
    <footer>
        <p>Don't have an account? <a href="{{ route('register') }}">Register</a></p>
    </footer>
</div>
</body>
</html>