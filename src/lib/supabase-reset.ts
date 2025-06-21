// Reset database script - untuk menghapus semua tabel yang ada
import { supabase } from '@/integrations/supabase/client';

export const resetDatabase = async () => {
  console.log('🗑️ Menghapus semua tabel yang ada...');
  
  // Daftar semua tabel yang mungkin ada
  const tablesToDrop = [
    'referral_transactions',
    'referral_codes', 
    'settings_history',
    'app_settings',
    'variant_options',
    'recycle_bin',
    'admin_logs',
    'orders_tracking',
    'orders',
    'profiles',
    'products'
  ];

  // Drop semua tabel
  for (const table of tablesToDrop) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP TABLE IF EXISTS ${table} CASCADE;`
      });
      if (error) {
        console.log(`Table ${table} tidak ada atau sudah dihapus`);
      } else {
        console.log(`✅ Tabel ${table} berhasil dihapus`);
      }
    } catch (err) {
      console.log(`Table ${table} tidak ada atau sudah dihapus`);
    }
  }

  // Drop functions
  const functionsToDrop = [
    'is_admin()',
    'update_updated_at_column()',
    'increment_referral_stats(text, numeric)',
    'confirm_referral_transaction(uuid, uuid)',
    'cancel_referral_transaction(uuid, uuid)'
  ];

  for (const func of functionsToDrop) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP FUNCTION IF EXISTS ${func} CASCADE;`
      });
      if (error) {
        console.log(`Function ${func} tidak ada atau sudah dihapus`);
      } else {
        console.log(`✅ Function ${func} berhasil dihapus`);
      }
    } catch (err) {
      console.log(`Function ${func} tidak ada atau sudah dihapus`);
    }
  }

  console.log('🎉 Database reset selesai!');
};