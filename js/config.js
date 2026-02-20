// Supabase Configuration
const SUPABASE_URL = 'https://fuddzrlnbrseofguuikp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZGR6cmxuYnJzZW9mZ3V1aWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDE5NjMsImV4cCI6MjA4NzE3Nzk2M30.pAWnJbzoS-mWOt3LiCVSxb1exm8eT0_rAfT9kSt2XJo';

// Initialize Supabase client
// The CDN loads at window.supabase, we need to get createClient from it
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
