import { Card } from "@/components/ui/card";
import { db } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_base/resgate/")({
  component: App,
  loader: async () => {
    const vendas: Vendas[] = await db.select("SELECT * FROM vendas");
    return { vendas };
  },
});

function App() {
  const parentRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");

  const { vendas } = Route.useLoaderData();

  const filtered = useMemo(() => {
    if (!vendas) return [];

    return vendas.filter((venda) => venda.id.toString().includes(search));
  }, [vendas, search]);

  const [columns, setColumns] = useState(1);

  useEffect(() => {
    function updateColumns() {
      if (!parentRef.current) return;

      const width = parentRef.current.offsetWidth;

      const minCardWidth = 220;

      const cols = Math.max(1, Math.floor(width / minCardWidth));

      setColumns(cols);
    }

    updateColumns();

    const resizeObserver = new ResizeObserver(updateColumns);

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const cardHeight = 200;
  const rows = Math.ceil(filtered.length / columns);
  const gap = 16;

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight + gap,
    overscan: 5,
  });

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar venda..."
        className="border rounded-lg p-2"
      />

      <div ref={parentRef} className="flex-1 min-h-0 overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columns;

            const items = filtered.slice(startIndex, startIndex + columns);

            return (
              <div
                key={virtualRow.key}
                className="grid gap-4 absolute left-0 w-full"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {items.map((venda) => (
                  <Link
                    key={venda.id}
                    to="/"
                    search={{
                      venda: venda.id.toString(),
                    }}
                  >
                    <Card className="border p-4 rounded-2xl h-50">
                      <div className="flex">
                        <label>Numero:&nbsp;</label>
                        <p>{venda.id}</p>
                      </div>

                      <div className="flex">
                        <label>Valor:&nbsp;</label>
                        <p>{venda.valor_total.toFixed(2)}</p>
                      </div>

                      <div className="flex">
                        <label>Desconto:&nbsp;</label>
                        <p>{venda.valor_desconto.toFixed(2)}</p>
                      </div>

                      <div className="flex">
                        <label>Data:&nbsp;</label>
                        <p>{venda.data_venda}</p>
                      </div>
                      <Button>Resgatar</Button>
                    </Card>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
