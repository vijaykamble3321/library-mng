import "dotenv/config"

const serverConfig={
port:process.env.PORT || 5001,
dburl:process.env.DB_URL,
frontend:process.env.FRONTEND,

}
export default serverConfig;
