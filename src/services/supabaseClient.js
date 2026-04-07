import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljucklblmesoduoekjav.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdWNrbGJsbWVzb2R1b2VramF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTQxODMsImV4cCI6MjA4NzE5MDE4M30.6Bhd8kWXxgyLl1D5LaJcnfPDoNCYRLipYPjoJgwldPs'

export const supabase = createClient(supabaseUrl, supabaseKey)