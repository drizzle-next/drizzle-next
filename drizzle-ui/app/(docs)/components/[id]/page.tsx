import { ComponentCode } from "@/components/component-layout/component-code";
import { ComponentDescription } from "@/components/component-layout/component-description";
import { ComponentPage } from "@/components/component-layout/component-page";
import { ComponentPreview } from "@/components/component-layout/component-preview";
import { ComponentTitle } from "@/components/component-layout/component-title";

const componentMap: { [key: string]: React.ComponentType } = {
  alert: AlertDemo,
  avatar: AvatarDemo,
};

import { AlertDemo } from "@/components/component-demo/alert-demo";
import { getFileContent } from "@/lib/file-utils";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { AvatarDemo } from "@/components/component-demo/avatar-demo";

type Params = Promise<{ id: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;

  const markdownFilePath = path.join(
    process.cwd(),
    "content",
    params.id + ".md"
  );
  if (!fs.existsSync(markdownFilePath)) {
    notFound();
  }
  const fileContent = getFileContent(markdownFilePath);

  const { data } = matter(fileContent);

  const code = getFileContent(data.code);
  const usage = getFileContent(data.usage);

  const DynamicComponent = componentMap[params.id] || null;

  return (
    <ComponentPage>
      <ComponentTitle>{data.title}</ComponentTitle>
      <ComponentDescription>{data.description}</ComponentDescription>
      <ComponentPreview>
        <DynamicComponent />
      </ComponentPreview>
      <ComponentCode language="ts" code={code} title="Code" />
      <ComponentCode language="ts" code={usage} title="Usage" />
    </ComponentPage>
  );
}
