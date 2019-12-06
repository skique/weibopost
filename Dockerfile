# 这里是别人已经搭建好的的一个pupptr运行换季环境                                                           
FROM buildkite/puppeteer                                                                         
                                                                                                 
WORKDIR /app                                                                                     
                                                                                                 
# 把当当前目录的模样   所有内容都拷贝到 app工作目录                                                                   
COPY . /app                                                                                      
                                                                                                 
                                                                                                 
RUN npm install -g yarn \                                                                         
 && yarn install        \
 && npm run start                                                                             
                                                                                                 
# 完成  