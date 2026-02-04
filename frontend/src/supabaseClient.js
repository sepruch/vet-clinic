import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://nxxrpqhfnfyluspgsvva.supabase.co'
const supabaseKey = 'sb_publishable_3LvwhCkMqgc5HTJz1T8bCQ_ak5En_pK'

export const supabase = createClient(supabaseUrl, supabaseKey)