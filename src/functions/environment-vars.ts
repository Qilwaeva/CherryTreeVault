interface Env {
  code_table_name: string;
  settings_table_name: string;
  workers_table_name: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response(`Environment Variables: ${env}`);
  },
};
