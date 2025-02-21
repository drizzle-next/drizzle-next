import { capitalCase } from "change-case-all";
import {
  Button,
  PageAside,
  PageAsideToggle,
  PageContent,
  PageFooter,
  PageHeader,
  PageLayout,
  PageNav,
  PageTitle,
  Pagination,
} from "drizzle-ui";
import { DrizzleTable } from "../components/drizzle-table";
import { DrizzleFilter } from "../drizzle-filter";
import { parseSearchParams } from "../utils";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  like,
  lt,
  lte,
  ne,
  ilike,
  getTableColumns,
} from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
  ColumnInfoMap,
  DrizzleCmsConfig,
  Params,
  SearchParams,
} from "../types";
import Link from "next/link";
import { ObjectUpdateForm } from "../components/object-update-form";

export interface ListPageParams {
  curTable: string;
  simplifiedColumns: { name: string; dataType: any }[];
  config: DrizzleCmsConfig;
}

const operatorMap = {
  "=": eq,
  "<>": ne,
  ">": gt,
  "<": lt,
  ">=": gte,
  "<=": lte,
  Contains: like,
  "Contains - Case Insensitive": ilike,
};

export async function ListPage(props: {
  params: Params;
  searchParams: SearchParams;
  config: DrizzleCmsConfig;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const filtersParam = searchParams.filters;

  let filters: Array<{ column: string; operator: string; value: string }> = [];

  if (filtersParam) {
    try {
      // Decode and parse the URL-encoded JSON
      filters = JSON.parse(decodeURIComponent(filtersParam));
      // return filters;
    } catch (error) {
      return "Invalid filters format";
    }
  }

  const config = props.config;
  const db = props.config.db;

  const curTable = params.segments[0];

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

  if (config.dbDialect === "sqlite" || config.dbDialect === "mysql") {
    operatorMap["Contains - Case Insensitive"] = like;
  }

  const whereClause = [];

  for (const filter of filters) {
    if (!filter.column && !filter.operator && !filter.value) continue;
    if (!(filter.operator in operatorMap)) {
      throw new Error("operator invalid");
    }
    const op = operatorMap[filter.operator as keyof typeof operatorMap];
    const col = drizzleSchema[filter.column];
    let parsedValue;
    if (col.dataType === "date" && filter.operator !== "Contains") {
      parsedValue = new Date(filter.value);
    } else if (filter.operator.startsWith("Contains")) {
      parsedValue = `%${filter.value}%`;
    } else {
      parsedValue = filter.value;
    }

    whereClause.push(op(drizzleSchema[filter.column], parsedValue));
  }

  const count = await db.$count(drizzleSchema, and(...whereClause));

  const totalPages = Math.ceil(count / pageSize);

  const list = await db.query[schema.path].findMany({
    limit: pageSize,
    offset: pageIndex * pageSize,
    orderBy: orderBy,
    where: and(...whereClause),
  });
  const simplifiedColumns = tableConf.columns.map((col) => {
    return {
      name: col.name,
      dataType: col.dataType,
    };
  });

  const cols = getTableColumns(drizzleSchema);
  const columnInfoMap: ColumnInfoMap = {};
  for (const col in cols) {
    columnInfoMap[col] = drizzleSchema[col].dataType;
  }

  let obj;
  if (searchParams.id) {
    obj = await db.query[schema.path].findFirst({
      where: eq(drizzleSchema.id, searchParams.id),
    });
    console.log(obj);
  }

  return (
    <PageLayout asideOpen={!!obj}>
      <PageHeader>
        <PageTitle className="flex gap-5 items-center">
          {capitalCase(curTable)}{" "}
          <Link href={`${config.basePath}/${curTable}/new`}>
            <Button className="rounded-2xl" variant="muted">
              New
            </Button>
          </Link>
        </PageTitle>
        <PageNav className="flex-wrap px-0">
          <PageAsideToggle />
        </PageNav>
      </PageHeader>
      <PageContent className="h-[calc(100vh-175px)] p-1">
        <DrizzleFilter simplifiedColumns={simplifiedColumns} />
        <DrizzleTable
          list={list}
          config={{
            basePath: config.basePath,
            columns: simplifiedColumns,
            curTable: curTable,
          }}
        />
      </PageContent>
      <PageAside>
        {obj && (
          <ObjectUpdateForm
            obj={obj}
            curTable={curTable}
            columnInfoMap={columnInfoMap}
          />
        )}
      </PageAside>
      <PageFooter>
        <Pagination
          count={count}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
        />
      </PageFooter>
    </PageLayout>
  );
}
