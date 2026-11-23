// Declarative pipeline for playwright-api-claude.
// Intended job type: Multibranch Pipeline (GitHub Branch Source plugin) so
// this file is discovered on every branch AND every PR.
//
// Runs directly on the Jenkins agent host (no Docker, same pattern as
// playwright-cli-claude's Jenkinsfile) — a Homebrew-installed Jenkins
// started via `brew services` launches with a minimal launchd PATH that
// doesn't include Homebrew's own bin dir, so it's prepended explicitly.
pipeline {
  agent any

  parameters {
    string(name: 'TAG', defaultValue: '@smoke',
           description: 'Playwright --grep filter. @smoke = merge gate; use @happy, @auth, etc. for other slices; leave EMPTY to run the full suite.')
  }

  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
  }

  environment {
    PATH = "/opt/homebrew/bin:${env.PATH}"
    CI = 'true'
    BASE_URL = 'https://dummyjson.com'
    TAG = "${params.TAG ?: ''}"
  }

  stages {
    stage('Restore flaky history') {
      steps {
        script {
          try {
            copyArtifacts(projectName: env.JOB_NAME, selector: lastCompleted(),
                           filter: 'reports/history/flaky-history.json', optional: true)
          } catch (e) {
            echo 'No previous history yet'
          }
        }
      }
    }
    stage('Install') { steps { sh 'npm ci' } }
    stage('API tests') {
      steps {
        script {
          def tag = (params.TAG ?: '').trim()
          echo tag ? "Running tests matching: ${tag}" : 'Running FULL suite'
        }
        // TAG passed via env to avoid shell-quoting/injection issues.
        sh 'if [ -n "$TAG" ]; then npx playwright test --grep "$TAG"; else npx playwright test; fi'
      }
    }
  }

  post {
    always {
      sh 'npx tsx .claude/skills/flaky-monitor/scripts/analyze-flaky.ts || true'
      junit allowEmptyResults: true, testResults: 'reports/junit.xml'
      publishHTML(target: [reportDir: 'reports/html', reportFiles: 'index.html',
                            reportName: 'Playwright Report', keepAll: true, alwaysLinkToLastBuild: true])
      archiveArtifacts artifacts: 'reports/**, test-results/**/trace.zip', allowEmptyArchive: true
    }
  }
}
