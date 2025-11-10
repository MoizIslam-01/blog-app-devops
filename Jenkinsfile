pipeline {
    agent any

    environment {
        DOCKER_HOST = 'unix:///var/run/docker.sock'
        VITE_SUPABASE_URL = 'https://prhsliwzscnekhpbnwnq.supabase.co'
        VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaHNsaXd6c2NuZWtocGJud25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDI3OTksImV4cCI6MjA3ODI3ODc5OX0.4XwTD491YO55bad5--ywf5RJqnGZuEkULkluaHfVneU'
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
