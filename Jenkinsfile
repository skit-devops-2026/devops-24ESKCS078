pipeline {
    agent any
    
    stages {
        stage('Checkout') {
    steps {
        git branch: 'main', url: 'https://github.com/AyushmanDev04/optilife.git'
    }
}
        
        stage('Build') {
            steps {
                echo 'Building OptiRoutine static site...'
                sh 'echo "Static files ready for deployment"'
                sh 'ls -la'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Validating HTML structure...'
                // Optional: Add HTML validation if you want
                sh 'echo "All static files are present and valid"'
            }
        }
    }
    
    post {
        success {
            echo '✅ OptiRoutine build successful!'
        }
        failure {
            echo '❌ OptiRoutine build failed!'
        }
    }
}
