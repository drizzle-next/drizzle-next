import { capitalCase } from "change-case-all";
import { asc, desc, sql } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Sortable,
  TableHead,
  Pagination,
  TableRowActions,
} from "drizzle-ui";
import { DrizzleCmsLayout } from "./drizzle-cms-layout";
import Link from "next/link";

type Params = Promise<{ [key: string]: string }>;
type SearchParams = Promise<{ [key: string]: string | undefined }>;

export type DrizzleCmsConfig = {
  basePath: string;
  schema: {
    [key: string]: {
      drizzleSchema: any;
      label: string;
      path: string;
    };
  };
};

export type DrizzleCmsLayoutConfig = {
  basePath: string;
  schema: {
    [key: string]: {
      label: string;
      path: string;
    };
  };
};

export async function DrizzleCms(props: {
  params: Params;
  searchParams: SearchParams;
  config: DrizzleCmsConfig;
  db: any;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const config = props.config;
  const db = props.db;

  const curTable = params.slug;

  const schema = config.schema[curTable];

  const drizzleSchema = schema.drizzleSchema;

  const {
    page = 1,
    pageIndex = 0,
    pageSize = 10,
    search,
    sortKey = "createdAt",
    sortOrder = "desc",
  } = parseSearchParams(searchParams);

  const count = await db.$count(drizzleSchema);

  const totalPages = Math.ceil(count / pageSize);

  let orderBy;

  if (sortKey && sortKey in drizzleSchema) {
    switch (sortOrder) {
      case "asc":
        orderBy = asc(drizzleSchema[sortKey as keyof typeof drizzleSchema]);
        break;
      case "desc":
        orderBy = desc(drizzleSchema[sortKey as keyof typeof drizzleSchema]);
        break;
      default:
        break;
    }
  }

  const tableConf = getTableConfig(drizzleSchema);

  let filter;
  if (search) {
    filter = sql`${search}`;
  }

  const list = await db.query[schema.path].findMany({
    limit: pageSize,
    offset: pageIndex * pageSize,
    orderBy: orderBy,
  });
  const simplifiedColumns = tableConf.columns.map((col) => {
    return {
      name: col.name,
      dataType: col.dataType,
    };
  });

  const slimSchema: { [key: string]: { label: string; path: string } } = {};

  Object.entries(config.schema).forEach(
    ([key, value]) =>
      (slimSchema[key] = { label: value.label, path: value.path })
  );

  const drizzleCmsLayoutConfig: DrizzleCmsLayoutConfig = {
    basePath: config.basePath,
    schema: slimSchema,
  };

  return (
    <DrizzleCmsLayout config={drizzleCmsLayoutConfig}>
      <div className="flex flex-col gap-5 p-4">
        {/* <div>params: {JSON.stringify(params)}</div>
        <div>searchParams: {JSON.stringify(searchParams)}</div>
        <div>curTable {curTable}</div> */}
        <DrizzleTable
          list={list}
          columns={simplifiedColumns}
          curTable={curTable}
          config={config}
        />
        <Pagination
          count={count}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
        />
      </div>
    </DrizzleCmsLayout>
  );
}

export function parseSearchParams(searchParams: Awaited<SearchParams>) {
  const page =
    typeof searchParams.page === "string"
      ? parseInt(searchParams.page)
      : undefined;
  const pageIndex = page ? page - 1 : undefined;
  const pageSize =
    typeof searchParams.pageSize === "string"
      ? parseInt(searchParams.pageSize)
      : undefined;
  const search = searchParams.search;
  const sortKey = searchParams.sortKey;
  const sortOrder = searchParams.sortOrder;
  return {
    page,
    pageIndex,
    pageSize,
    search,
    sortKey,
    sortOrder,
  };
}

export interface SimplifiedColumn {
  name: string;
  dataType: string;
}

export function DrizzleTable({
  columns,
  list,
  config,
  curTable,
}: {
  columns: SimplifiedColumn[];
  list: Record<string, any>;
  config: DrizzleCmsConfig;
  curTable: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => {
            return (
              <TableHead key={col.name}>
                <Sortable column={col.name}>{capitalCase(col.name)}</Sortable>
              </TableHead>
            );
          })}
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((row: Record<string, any>) => {
          return (
            <TableRow key={row.id}>
              {columns.map((col) => {
                return (
                  <TableCell key={col.name}>
                    {col.dataType === "date" && row[col.name]?.toLocaleString()}
                    {col.dataType === "json" && JSON.stringify(row[col.name])}
                    {col.dataType === "string" && row[col.name]}
                    {col.dataType === "number" && row[col.name]}
                  </TableCell>
                );
              })}
              <TableCell>
                <TableRowActions>
                  <Link href={`${config.basePath}/${curTable}/${row.id}`}>
                    View
                  </Link>
                  <Link href={`${config.basePath}/${curTable}/${row.id}/edit`}>
                    Edit
                  </Link>
                  <Link
                    href={`${config.basePath}/${curTable}/${row.id}/delete`}
                  >
                    Delete
                  </Link>
                </TableRowActions>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
