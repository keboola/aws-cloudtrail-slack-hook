FROM amazonlinux

# node + yarn
RUN yum -y groupinstall 'Development Tools'
RUN curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
RUN curl --silent https://dl.yarnpkg.com/rpm/yarn.repo > /etc/yum.repos.d/yarn.repo
RUN yum -y install nodejs yarn

# serverless
RUN npm install -g serverless@2.51

# working directory
ADD ./ /code
WORKDIR /code

RUN yarn install
