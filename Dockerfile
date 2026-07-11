# ---- 构建阶段：干净 slim 底座 + curl 装 mise，按 mise.toml 装 node/pnpm ----
FROM debian:13-slim AS build

# mise 自身版本是唯一允许在 Dockerfile 钉死的版本（自举工具无法由 mise.toml 管）
ENV MISE_VERSION=v2026.6.0
ENV MISE_DATA_DIR=/mise MISE_CONFIG_DIR=/mise MISE_CACHE_DIR=/mise/cache \
    MISE_INSTALL_PATH=/usr/local/bin/mise PATH=/mise/shims:$PATH
# 只显式装本镜像所需工具；关掉 mise run 前的「自动装全部 [tools]」
ENV MISE_TASK_RUN_AUTO_INSTALL=false
# libatomic1：mise 装的 pnpm 是官方独立二进制（Node SEA 打包），运行时链接 libatomic.so.1，
# debian slim 底座默认不含，缺了 pnpm 一跑就 "error while loading shared libraries" 退 127
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git ca-certificates libatomic1 \
    && rm -rf /var/lib/apt/lists/* \
    && curl https://mise.run | sh

WORKDIR /app
# 工具链版本单一来源：只 COPY 根 mise.toml，据此装 node/pnpm（不 mise install 全装）
COPY mise.toml ./
RUN mise trust && mise install node pnpm

# 依赖清单先行、源码在后（层缓存：改源码不重装依赖）
# pnpm-workspace.yaml 一并带上：它含 allowBuilds（放行 esbuild 构建脚本），
# 缺了 install 会因构建脚本被拦而退出码 1，整个镜像构建失败
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN mise run install --frozen
COPY . .
# 构建走 mise task（命令单一来源）；buildEnd 钩子会把源 .md 拷进产物
RUN mise run build

# ---- 运行阶段：nginx 静态直发，构建工具不进最终镜像 ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 80
