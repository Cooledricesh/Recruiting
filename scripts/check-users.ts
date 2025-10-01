import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('role');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const roleCounts = data.reduce((acc: Record<string, number>, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  console.log('\n=== 회원가입자 현황 ===');
  console.log(`총 회원 수: ${data.length}명\n`);

  Object.entries(roleCounts).forEach(([role, count]) => {
    console.log(`${role}: ${count}명`);
  });
}

checkUsers();
