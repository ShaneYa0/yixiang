export async function generateFortuneReport(type: string, userData: unknown) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return "个性化深度解读暂未开通，请先查看当前基础结果。";
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是严谨、温和的现代命理解读助手，避免绝对化断言。" },
        { role: "user", content: `请撰写${type}深度解读：${JSON.stringify(userData)}` },
      ],
    }),
  });

  if (!response.ok) throw new Error("DeepSeek request failed");
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "暂未取得深度解读。";
}
