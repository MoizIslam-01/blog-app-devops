pipeline {
    agent any

    environment {
        DOCKER_HOST = 'unix:///var/run/docker.sock'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/MoizIslam-01/blog-app-devops.git'
            }
        }

        stage('Build and Deploy') {
            steps {
                script {
                    sh 'docker-compose down || true'
                    sh 'docker rm -f blog-app-devops_blog-app_1 || true'
                    sh 'docker-compose up --build -d'
                }
            }
        }

        stage('Verify') {
            steps {
                script {
                    sleep time: 30, unit: 'SECONDS'
                    sh 'curl -f http://localhost:3001 || exit 1'
                }
            }
        }
    }
}
