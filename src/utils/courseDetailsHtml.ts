export type CourseDetailsHtmlCategory = {
  id?: string;
  name: string;
};

export type CourseDetailsHtmlParams = {
  name: string;
  authorName: string;
  description: string;
  categories: CourseDetailsHtmlCategory[];
  createdDate: string;
  priceLabel: string;
  completionPercent: number;
  isDark: boolean;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const buildCourseDetailsHtml = (args: CourseDetailsHtmlParams) => {
  const palette = args.isDark
    ? {
        bodyBg: "#0A1020",
        panelBg: "#101A30",
        border: "#273A61",
        title: "#EAF1FF",
        body: "#B7C6E7",
        muted: "#8EA3CC",
        chipBg: "#1A2A4B",
        chipText: "#D8E4FF",
        accent: "#7FA8FF",
      }
    : {
        bodyBg: "#F4F7FF",
        panelBg: "#FFFFFF",
        border: "#D7E1F5",
        title: "#102543",
        body: "#455D81",
        muted: "#6E81A2",
        chipBg: "#E9F0FF",
        chipText: "#274785",
        accent: "#1D4ED8",
      };

  const categoryChips =
    args.categories.length > 0
      ? args.categories
          .map(
            (category) =>
              `<span class="chip">${escapeHtml(category.name)}</span>`,
          )
          .join("")
      : `<span class="chip">General</span>`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        background: ${palette.bodyBg};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .wrap { padding: 14px; }
      .panel {
        background: ${palette.panelBg};
        border: 1px solid ${palette.border};
        border-radius: 14px;
        padding: 14px;
      }
      .title {
        margin: 0;
        color: ${palette.title};
        font-size: 18px;
        font-weight: 800;
      }
      .author {
        margin: 6px 0 0;
        color: ${palette.muted};
        font-size: 12px;
        font-weight: 600;
      }
      .description {
        margin: 12px 0 0;
        color: ${palette.body};
        font-size: 13px;
        line-height: 1.55;
      }
      .chip-row {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .chip {
        background: ${palette.chipBg};
        color: ${palette.chipText};
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
      }
      .meta {
        margin-top: 14px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        border-top: 1px solid ${palette.border};
        padding-top: 12px;
      }
      .meta-label {
        color: ${palette.muted};
        font-size: 11px;
        font-weight: 600;
      }
      .meta-value {
        margin-top: 3px;
        color: ${palette.title};
        font-size: 13px;
        font-weight: 700;
      }
      .price {
        color: ${palette.accent};
        font-size: 16px;
        font-weight: 800;
      }
      .progress-wrap { margin-top: 12px; }
      .progress-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .progress-label {
        color: ${palette.muted};
        font-size: 11px;
        font-weight: 600;
      }
      .track {
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: ${palette.chipBg};
        overflow: hidden;
      }
      .fill {
        width: ${args.completionPercent}%;
        height: 100%;
        border-radius: 999px;
        background: ${palette.accent};
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="panel">
        <h1 class="title">${escapeHtml(args.name)}</h1>
        <p class="author">By ${escapeHtml(args.authorName)}</p>
        <p class="description">${escapeHtml(args.description)}</p>
        <div class="chip-row">${categoryChips}</div>
        <div class="progress-wrap">
          <div class="progress-row">
            <span class="progress-label">Progress</span>
            <span class="progress-label">${args.completionPercent}%</span>
          </div>
          <div class="track"><div class="fill"></div></div>
        </div>
        <div class="meta">
          <div>
            <div class="meta-label">Created</div>
            <div class="meta-value">${escapeHtml(args.createdDate)}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-label">Price</div>
            <div class="price">${escapeHtml(args.priceLabel)}</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};
