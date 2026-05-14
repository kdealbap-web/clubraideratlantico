import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

type TableName = 'members' | 'solicitudes' | 'events' | 'news' | 'gallery' | 'settings' | 'activity_log';

interface UseTableOpts {
  order?: { column: string; ascending?: boolean };
  filter?: Array<{ column: string; op: 'eq' | 'in' | 'neq'; value: string | number | string[] | number[] }>;
}

export function useTable<T>(table: TableName, opts: UseTableOpts = {}) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(opts.filter ?? []);
  const orderKey = JSON.stringify(opts.order ?? {});

  const load = useCallback(async () => {
    let q = supabase.from(table).select('*');
    if (opts.filter) {
      for (const f of opts.filter) {
        if (f.op === 'eq') q = q.eq(f.column, f.value as never);
        else if (f.op === 'neq') q = q.neq(f.column, f.value as never);
        else if (f.op === 'in') q = q.in(f.column, f.value as never);
      }
    }
    if (opts.order) {
      q = q.order(opts.order.column, { ascending: opts.order.ascending ?? true });
    }
    const { data, error: e } = await q;
    if (e) {
      setError(e.message);
      setRows([]);
    } else {
      setError(null);
      setRows((data ?? []) as T[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filterKey, orderKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, error, reload: load };
}
