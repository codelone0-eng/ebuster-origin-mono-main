# Исправление ошибки "permission denied for table referrals"

## Проблема
API возвращает ошибку:
```
permission denied for table referrals
```

## Причина
Таблица `referrals` имеет включенный Row Level Security (RLS), но нет политики, разрешающей доступ для service role.

## Решение

### Вариант 1: Через Supabase Dashboard (Рекомендуется)

1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Скопируйте и выполните содержимое файла:
   ```
   supabase/migrations/20250203_fix_referrals_rls.sql
   ```
5. Нажмите **Run**

### Вариант 2: Через Supabase CLI

```bash
# Если у вас установлен Supabase CLI
supabase db push

# Или примените миграцию напрямую
supabase db execute --file supabase/migrations/20250203_fix_referrals_rls.sql
```

### Вариант 3: Быстрое исправление (SQL команда)

Выполните в SQL Editor:

```sql
-- Включаем RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Создаем политику для service role (обход RLS)
DROP POLICY IF EXISTS "Service role bypass RLS" ON referrals;
CREATE POLICY "Service role bypass RLS"
  ON referrals
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Проверка

После применения миграции:

1. Перезапустите API сервер
2. Проверьте логи - ошибка должна исчезнуть
3. Откройте Dashboard и проверьте работу реферальной системы

## Дополнительно

Если ошибка сохраняется, проверьте:

1. **Используется ли правильный SERVICE_KEY** в `.env`:
   ```
   SUPABASE_SERVICE_KEY=eyJ... (должен начинаться с eyJ)
   ```

2. **Правильно ли настроен клиент** в `src/api/supabase-admin.ts`:
   ```typescript
   export const getSupabaseAdmin = () => {
     const supabaseUrl = process.env.SUPABASE_URL;
     const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Именно SERVICE_KEY!
     
     return createClient(supabaseUrl, supabaseKey);
   };
   ```

3. **Проверьте, что таблица существует**:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'referrals';
   ```

## Что было исправлено в коде

1. ✅ Заменен локальный `getSupabaseClient()` на общий `getSupabaseAdmin()`
2. ✅ Исправлены имена колонок: `start_date` → `started_at`
3. ✅ Добавлены RLS политики для service role
4. ✅ Унифицированы цвета иконок в UI

## Контакты

Если проблема сохраняется, проверьте:
- Логи Supabase Dashboard → Logs
- Права доступа к таблице в Database → Tables → referrals → RLS Policies
