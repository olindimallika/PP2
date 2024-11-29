# Got help from piazza as well as chatpgt, prompt was how to install docker images for sql
# Use a lightweight base image with SQLite
FROM alpine:latest

# Install SQLite
RUN apk add --no-cache sqlite

# Set the working directory
WORKDIR /app

# Default command to keep the container ready for SQL execution
CMD ["/bin/sh"]
