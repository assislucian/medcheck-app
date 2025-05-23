# Estrutura de Diretórios

- **.notes/**
  - directory_structure.md
  - generate_directory_structure.py
  - meeting_notes.md
  - project_overview.md
  - task_list.md
- CONTEXT.md
- DEPLOY_PLAN.md
- Dockerfile
- PRD.md
- README.md
- arquivo_grande.pdf
- backup_db.sh
- cadastro_novo_medico.json
- comparison_results.json
- cross_response.json
- cursorrules
- **data/**
  - **cbhpm/**
    - CBHPM2015_v1.xlsx
    - test_cbhpm.xlsx
  - **demonstrativos/**
    - Demonstrativo-abril_2024.pdf
    - Demonstrativo-outubro_2024.pdf
  - **guias/**
    - noivana.pdf
    - nubia_katia.pdf
    - rodrigo bernardo.pdf
    - thayse borges.pdf
- debug_8a259c72-a13e-42bd-bb6b-856dfda97b20_nubia_katia.pdf.txt
- debug_bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_0.pdf.txt
- debug_bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_1.pdf.txt
- debug_bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_2.pdf.txt
- debug_noivana_strings.txt
- debug_noivana_txt.txt
- demo_baixado_novo_medico.pdf
- demo_novo_medico.pdf
- demonstrativos_api_response.json
- diagnostico_parsers.py
- docker-compose.yml
- **docs/**
  - architecture.mermaid
  - status.md
  - technical.md
- **docs_cursor/**
  - auth_crm.md
  - core.md
  - **exemplos/**
    -  output_esperado_resumo.json
    - cbhpm_amostra.csv
    - noivana.pdf
    - nubia_katia.pdf
    - output_esperado.json
    - output_esperado_demonstrativos.json
    - output_esperado_guias.json
    - output_esperado_validacao.json
    - rodrigo bernardo.pdf
    - thayse borges.pdf
  - merge_valores.md
  - parser_demonstrativo.md
  - parser_guias.md
- **frontend/**
  - README.md
  - audit-report-final.json
  - audit-report.json
  - components.json
  - eslint.config.js
  - guia_noivana_bloco.txt
  - guia_noivana_execucao.txt
  - guia_noivana_tabela.txt
  - guia_noivana_tabela2.txt
  - guia_noivana_tabela3.txt
  - guia_noivana_text.txt
  - index.html
  - last_pytest_parsers.log
  - last_upload_output.json
  - package-lock.json
  - package.json
  - postcss.config.js
  - **public/**
    - favicon.ico
    - placeholder.svg
    - robots.txt
    - vite.svg
  - **src/**
    - App.css
    - App.tsx
    - **assets/**
      - react.svg
    - **components/**
      - ComparisonView.tsx
      - Dashboard.tsx
      - DemoRequestForm.tsx
      - ErrorBoundary.tsx
      - Layout.tsx
      - LoginForm.tsx
      - Navbar.tsx
      - PricingPlans.tsx
      - PrivateRoute.tsx
      - ProtectedRoute.tsx
      - RegisterForm.tsx
      - SideNav.tsx
      - StatusCard.tsx
      - ThemeToggle.tsx
      - UploadSection.tsx
      - **about/**
        - BenefitsSection.tsx
        - CtaSection.tsx
        - MissionSection.tsx
        - ProblemsSection.tsx
        - SolutionsSection.tsx
        - TestimonialsSection.tsx
        - **benefits/**
          - BenefitItem.tsx
        - **mission/**
          - MissionCard.tsx
          - MissionHeader.tsx
        - **problems/**
          - ProblemCard.tsx
        - **solutions/**
          - SolutionCard.tsx
        - **testimonials/**
          - TestimonialCard.tsx
          - TestimonialsHeader.tsx
      - **atoms/**
        - **Button/**
          - Button.tsx
        - **Card/**
          - Card.tsx
      - **auth/**
        - EmailField.tsx
        - ErrorAlert.tsx
        - PasswordField.tsx
        - PasswordForm.tsx
        - TokenValidation.tsx
        - TrialGuard.tsx
        - validation.ts
      - **checkout/**
        - CheckoutPage.tsx
        - OrderSummary.tsx
        - PaymentForm.tsx
        - types.ts
      - **comparison/**
        - CBHPMComparisonTable.tsx
        - CBHPMComparisonTableFilters.tsx
        - CBHPMComparisonTabs.tsx
        - CBHPMSummaryCards.tsx
        - ComparisonHeader.tsx
        - ComparisonTable.tsx
        - DemonstrativeInfo.tsx
        - ProceduresTable.tsx
        - SummaryCards.tsx
      - **contestation/**
        - ContestationDialog.tsx
      - **dashboard/**
        - AnalyticsChart.tsx
        - DashboardAlert.tsx
        - DashboardHeader.tsx
        - DashboardLayout.tsx
        - DashboardOverview.tsx
        - RecentActivities.tsx
        - StatusCards.tsx
        - **tabs/**
          - DashboardTabs.tsx
          - GlosasTab.tsx
          - PaymentStatementsTab.tsx
          - PaymentsTab.tsx
          - ProceduresTab.tsx
          - **columns/**
            - paymentStatementsColumns.tsx
            - proceduresColumns.tsx
          - **grids/**
            - PaymentStatementsGrid.tsx
            - ProceduresGrid.tsx
      - **guides/**
        - DetalhesGuia.tsx
        - GuideDetailDialog.tsx
      - **help/**
        - FAQSection.tsx
        - GuidesList.tsx
        - HelpContent.tsx
        - SearchBar.tsx
        - SearchResults.tsx
        - VideosList.tsx
      - **history/**
        - HistorySearch.tsx
        - HistoryTable.tsx
        - StatusBadge.tsx
        - data.ts
      - **landing/**
        - BenefitsSection.tsx
        - DemoSection.tsx
        - HeroSection.tsx
        - PricingSection.tsx
        - ProductFeatures.tsx
      - **layout/**
        - AuthenticatedLayout.tsx
        - Footer.tsx
        - MainLayout.tsx
        - PageHeader.tsx
        - PublicLayout.tsx
      - **navbar/**
        - GuestNavigation.tsx
        - HelpMenu.tsx
        - MobileMenu.tsx
        - NotificationsMenu.tsx
        - UserMenu.tsx
        - UserNavigation.tsx
      - **notifications/**
        - EmptyNotifications.tsx
        - NotificationCard.tsx
        - NotificationsList.tsx
      - **onboarding/**
        - GuidedTour.tsx
        - TourNavigation.tsx
        - tourSteps.ts
      - **pricing/**
        - PricingFAQ.tsx
        - PricingHeader.tsx
        - PricingPlan.tsx
        - planData.ts
        - types.ts
      - **profile/**
        - ActivitySummary.tsx
        - ProfileContainer.tsx
        - ProfileHeader.tsx
        - ProfileTabs.tsx
        - SubscriptionCard.tsx
        - **avatar/**
          - ProfileAvatar.tsx
        - **form/**
          - ProfileForm.tsx
        - **form-fields/**
          - BasicInfoFields.tsx
          - ProfessionalFields.tsx
        - **image/**
          - ProfileImageUpload.tsx
        - **security/**
          - SecurityForm.tsx
        - **stats/**
          - ProfileStats.tsx
        - **tabs/**
          - NotificationsTab.tsx
      - **reports/**
        - HospitalsTable.tsx
        - OverviewCharts.tsx
        - ReportsHeader.tsx
        - StatusCardsSection.tsx
        - data.ts
      - **settings/**
        - NotificationsSettings.tsx
        - ReferenceTablesSettings.tsx
        - **notifications/**
          - EmailSettings.tsx
          - NotificationSettings.tsx
          - SmsSettings.tsx
          - types.ts
        - **reference-tables/**
          - RolesList.tsx
          - TablesList.tsx
          - types.ts
      - **sidebar/**
        - AppSidebar.tsx
      - **sidenav/**
        - AccountSection.tsx
        - FooterSection.tsx
        - HelpSection.tsx
        - MainNavigation.tsx
        - NotificationsSection.tsx
        - ProfileSection.tsx
        - **__tests__/**
          - AccountSection.test.tsx
          - FooterSection.test.tsx
          - HelpSection.test.tsx
          - MainNavigation.test.tsx
          - NotificationsSection.test.tsx
          - ProfileSection.test.tsx
          - SideNav.test.tsx
      - **support/**
        - NewTicketForm.tsx
        - SupportLayout.tsx
        - TicketDetail.tsx
        - TicketList.tsx
        - helpers.ts
        - types.ts
      - **ui/**
        - LoaderTable.tsx
        - accordion.tsx
        - alert-dialog-provider.tsx
        - alert-dialog.tsx
        - alert.tsx
        - aspect-ratio.tsx
        - avatar.tsx
        - badge.tsx
        - breadcrumb.tsx
        - button.tsx
        - calendar.tsx
        - card.tsx
        - carousel.tsx
        - chart.tsx
        - checkbox.tsx
        - collapsible.tsx
        - command.tsx
        - context-menu.tsx
        - data-grid.tsx
        - date-range-picker.tsx
        - dialog.tsx
        - drawer.tsx
        - dropdown-menu.tsx
        - form.tsx
        - hover-card.tsx
        - input-otp.tsx
        - input.tsx
        - label.tsx
        - loading-spinner.tsx
        - menubar.tsx
        - navigation-menu.tsx
        - pagination.tsx
        - popover.tsx
        - progress.tsx
        - radio-group.tsx
        - resizable.tsx
        - scroll-area.tsx
        - select.tsx
        - separator.tsx
        - sheet.tsx
        - sidebar.tsx
        - skeleton.tsx
        - slider.tsx
        - sonner.tsx
        - switch.tsx
        - table.tsx
        - tabs.tsx
        - textarea.tsx
        - toast.tsx
        - toaster.tsx
        - toggle-group.tsx
        - toggle.tsx
        - tooltip.tsx
        - use-toast.ts
      - **unpaid-procedures/**
        - ResourceDialog.tsx
        - UnpaidProcedureDetailDialog.tsx
      - **upload/**
        - FileDropZone.tsx
        - FileList.tsx
        - ProcessingSection.tsx
        - UploadActionButtons.tsx
        - UploadAlerts.tsx
        - UploadContextAlerts.tsx
        - UploadDropzoneArea.tsx
        - UploadError.tsx
        - UploadInstructions.tsx
        - UploadProgress.tsx
        - UploadSection.tsx
        - UploadStatus.tsx
        - UploadSuccess.tsx
        - **__tests__/**
          - UploadSection.test.tsx
    - **context/**
      - AuthContext.tsx
    - **contexts/**
      - AuthContext.ts
      - AuthContext.tsx
      - NotificationContext.tsx
      - ThemeProvider.tsx
      - **auth/**
        - AuthContext.tsx
        - authUtils.ts
        - types.ts
        - useAuthActions.ts
        - useAuthState.ts
      - index.ts
    - **data/**
      - cbhpmData.ts
      - cbhpmTable.json
      - helpFAQs.ts
      - helpGuides.ts
      - referenceTables.ts
    - **design-system/**
      - **tokens/**
        - colors.ts
        - index.ts
        - spacing.ts
        - typography.ts
    - **docs/**
      - GoogleAuthSetup.md
    - **hooks/**
      - **profile/**
        - use-profile-avatar.ts
        - use-profile-data.ts
        - use-profile-notifications.ts
        - use-profile-security.ts
      - **upload/**
        - useFileList.ts
        - useFileUploadService.ts
        - useProcessingStatus.ts
        - useUploadProcessing.ts
      - use-dashboard-stats.ts
      - use-mobile.ts
      - use-mobile.tsx
      - use-onboarding.ts
      - use-profile-avatar.ts
      - use-profile-form.ts
      - use-profile.ts
      - use-theme.tsx
      - use-toast.ts
      - use-trial-status.ts
      - useComparisonData.ts
      - useDemonstrativoSelection.ts
      - useFileUpload.ts
      - useTickets.ts
    - index.css
    - **integrations/**
      - **mock/**
        - README.md
        - mockData.ts
      - **supabase/**
        - client.ts
        - types.ts
    - **layout/**
      - PublicLayout.tsx
    - **lib/**
      - featureFlags.ts
      - utils.ts
    - main.tsx
    - mui-theme.tsx
    - **pages/**
      - About.tsx
      - Analysis.tsx
      - AuthCallback.tsx
      - AuthTest.tsx
      - Checkout.tsx
      - CompareContracheque.tsx
      - Contact.tsx
      - Dashboard.tsx
      - Demonstratives.tsx
      - ForgotPassword.tsx
      - Glosas.tsx
      - Guides.tsx
      - Help.tsx
      - History.tsx
      - Home.tsx
      - HowItWorks.tsx
      - Index.tsx
      - LockScreen.tsx
      - Login.tsx
      - NewAudit.tsx
      - NotFound.tsx
      - Notifications.tsx
      - Pricing.tsx
      - Privacy.tsx
      - Profile.tsx
      - PublicHelp.tsx
      - ReferenceTables.tsx
      - Register.tsx
      - Reports.tsx
      - ResetPassword.tsx
      - Settings.tsx
      - Support.tsx
      - Terms.tsx
      - UnpaidProcedures.tsx
      - UpdatePassword.tsx
      - Uploads.tsx
      - Validation.tsx
      - Welcome.tsx
    - **services/**
      - **analysis/**
        - getAnalysisService.ts
        - historyService.ts
        - saveAnalysisService.ts
      - analysisService.ts
      - contestationService.ts
      - databaseService.ts
      - **export/**
        - README-pt.md
        - README.md
        - excelExport.ts
        - fhirExport.ts
        - index.ts
        - tissExport.ts
        - types.ts
      - exportService.ts
      - fileUploadEdge.ts
      - fileUploadService.ts
      - guides.ts
      - **history/**
        - analysisDetails.ts
        - fetchHistory.ts
        - index.ts
        - search.ts
        - statusUpdate.ts
      - historyService.ts
      - messageUtils.ts
      - mockData.ts
      - processingService.ts
      - **reports/**
        - hospitalService.ts
        - index.ts
        - monthlyService.ts
        - totalsService.ts
      - simulatedUploadService.ts
      - unpaidProceduresService.ts
      - **upload/**
        - analysisService.ts
        - edgeService.ts
        - index.ts
        - storageService.ts
      - uploadModeUtils.ts
    - **styles/**
      - base.css
    - **test/**
      - setup.ts
      - **smoke/**
        - auth.test.ts
        - features.test.ts
        - health.test.ts
        - history.test.ts
        - rls.test.ts
        - upload.test.ts
      - **unit/**
        - analysisHelpers.test.ts
        - helpHelpers.test.ts
        - **history/**
          - analysisDetails.test.ts
          - fetchHistory.test.ts
          - search.test.ts
          - statusUpdate.test.ts
        - procedureHelpers.test.ts
        - profileHelpers.test.ts
        - queryHelpers.test.ts
      - vitest-env.d.ts
    - test-setup.ts
    - **types/**
      - help.ts
      - index.ts
      - jest-dom.d.ts
      - medical.ts
      - upload.ts
    - **utils/**
      - alertUtils.ts
      - comparisonFallback.ts
      - comparisonSupabase.ts
      - fileValidation.ts
      - format.ts
      - formatters.ts
      - **supabase/**
        - analysisHelpers.ts
        - helpHelpers.ts
        - index.ts
        - procedureHelpers.ts
        - profileHelpers.ts
        - queryHelpers.ts
        - **services/**
          - procedureService.ts
        - supabaseHelpers.ts
      - supabaseHelpers.ts
      - uploadUtils.ts
    - vite-env.d.ts
  - tailwind.config.ts
  - tsconfig.app.json
  - tsconfig.json
  - tsconfig.node.json
  - vite.config.ts
- guia_noivana_full.txt
- jest.config.js
- last_pytest.log
- last_pytest_parsers.log
- last_test.log
- last_upload_output.json
- lista_demos_novo_medico.json
- lista_demos_novo_medico2.json
- log_noivana_texto.txt
- log_parser_6091_final.txt
- log_parser_6091_final5.txt
- log_parser_6091_json.txt
- log_parser_6091_json_final.txt
- log_parser_6091_json_final2.txt
- log_parser_6091_json_final3.txt
- log_parser_6091_json_final4.txt
- **logs/**
  - medcheck_audit.log
- logs_teste.txt
- logs_teste2.txt
- medcheck-dados-usuario.zip
- medicos.db
- novo_medico.json
- package-lock.json
- package.json
- parser_corrigido.txt
- parser_corrigido_final.txt
- **prisma/**
  - schema.prisma
- prometheus.yml
- relatorio_cross.csv
- requirements.txt
- resposta_arquivo_grande.json
- restore_db.sh
- resultado.json
- **results/**
  - 04384285-82e7-4b63-9072-127c1788f30a.json
  - 1e004a6c-de09-4223-951e-cde1df099fd5_relatorio.csv
  - 44489bcc-c0e3-470c-895f-9197706a7dcf_relatorio.csv
  - 57417b00-e05d-40c4-8695-d4e083f654a0_relatorio.csv
  - 991a6532-be68-4dbb-a64b-720aebc99c6d.json
  - bf14a491-9688-4ae7-ab85-55c2ae7a8a69_relatorio.csv
  - c4d7648c-522f-4866-b2ee-1b529c29948e_relatorio.csv
  - f4bd71ab-4f3a-406b-84f3-2cf6e9945b28_relatorio.csv
- run_tests.py
- **src/**
  - __init__.py
  - api.py
  - **comparators/**
    - __init__.py
    - procedure_comparator.py
  - **components/**
    - **custom/**
      - DataTable.tsx
    - **layout/**
      - Section.tsx
    - **marketing/**
      - FeatureCard.tsx
      - PricingCard.tsx
    - **ui/**
      - badge.tsx
      - button.tsx
      - card.tsx
      - cn.ts
      - dropdown-menu.tsx
      - input.tsx
      - table.tsx
      - tooltip.tsx
  - main.py
  - medicos.db
  - **models/**
    - procedure-guide.model.ts
    - role.enum.ts
    - validation-config.model.ts
    - validation-result.model.ts
  - **openapi/**
    - index.yaml
  - **pages/**
    - Guides.tsx
  - **parsers/**
    - __init__.py
    - cbhpm_parser.py
    - demonstrativo_parser.py
    - guia_parser.py
    - interfaces.ts
    - parser-factory.ts
    - pdf-parser.ts
  - parsers.py
  - schema.py
  - **services/**
    - **__tests__/**
      - validation.service.test.ts
  - **uploads/**
    - 0fdfac2a-39f0-4a67-bd92-28add0f32e3b_Demonstrativo-outubro_2024.pdf
    - 65ecb439-3e0d-40e2-8d94-740a7fd071e9_Demonstrativo-abril_2024.pdf
    - thayse borges.pdf
  - **utils/**
    - errors.ts
    - paths.ts
    - references.ts
    - retry.ts
- status_response.json
- status_sem_token.json
- **tasks/**
  - tasks.md
- test_guia_parser.py
- test_validate_guias.py
- test_validate_prestador.py
- testa_guias.py
- **tests/**
  - test_comparison.py
  - test_parsers.py
  - test_parsing.py
- **tmp_audit_facil/**
  - ARCHITECTURE.md
  - DEV_SETUP.md
  - DOCUMENTATION.md
  - README.md
  - **backend/**
    - README.md
    - **config/**
      - supabase.ts
    - **functions/**
      - **generate-compare/**
        - index.ts
      - **generate-report/**
        - auth.ts
        - fetchAnalyses.ts
        - index.ts
        - parseRequest.ts
        - **reports/**
          - hospital.ts
          - monthly.ts
          - procedure.ts
          - summary.ts
        - respond.ts
      - **get-analysis/**
        - index.ts
      - **process-analysis/**
        - index.ts
      - **upload-files/**
        - index.ts
    - **migrations/**
      - 00-database-schema.sql
      - 01-function-triggers.sql
    - **models/**
      - schemas.ts
      - types.ts
    - package.json
    - **scripts/**
      - deploy-functions.js
      - migrate.js
    - **services/**
      - comparisonService.ts
      - databaseService.ts
      - guiaProcessingService.ts
      - **history/**
        - analysisDetails.ts
        - fetchHistory.ts
        - index.ts
        - search.ts
        - statusUpdate.ts
      - processingService.ts
      - reportGeneratorsService.ts
      - reportHelpersService.ts
      - reportTotalsService.ts
      - uploadService.ts
    - **tests/**
      - compare.test.ts
    - tsconfig.json
    - **utils/**
      - errorHandler.ts
      - exportService.ts
      - logger.ts
  - **brand-kit/**
    - **assets/**
      - business-card.tsx
      - medcheck-logo-full.svg
      - medcheck-logo-horizontal.svg
      - medcheck-logo-icon.svg
      - social-media-banner.tsx
    - colors.ts
    - logo.tsx
    - style-guide.md
    - typography.ts
  - bun.lockb
  - components.json
  - eslint.config.js
  - index.html
  - package-lock.json
  - package.json
  - postcss.config.js
  - **public/**
    - favicon.ico
    - placeholder.svg
    - robots.txt
  - **src/**
    - App.css
    - App.tsx
    - **components/**
      - ComparisonView.tsx
      - Dashboard.tsx
      - DemoRequestForm.tsx
      - ErrorBoundary.tsx
      - LoginForm.tsx
      - Navbar.tsx
      - PricingPlans.tsx
      - PrivateRoute.tsx
      - RegisterForm.tsx
      - SideNav.tsx
      - StatusCard.tsx
      - ThemeToggle.tsx
      - UploadSection.tsx
      - **about/**
        - BenefitsSection.tsx
        - CtaSection.tsx
        - MissionSection.tsx
        - ProblemsSection.tsx
        - SolutionsSection.tsx
        - TestimonialsSection.tsx
        - **benefits/**
          - BenefitItem.tsx
        - **mission/**
          - MissionCard.tsx
          - MissionHeader.tsx
        - **problems/**
          - ProblemCard.tsx
        - **solutions/**
          - SolutionCard.tsx
        - **testimonials/**
          - TestimonialCard.tsx
          - TestimonialsHeader.tsx
      - **auth/**
        - EmailField.tsx
        - ErrorAlert.tsx
        - PasswordField.tsx
        - PasswordForm.tsx
        - TokenValidation.tsx
        - TrialGuard.tsx
        - validation.ts
      - **checkout/**
        - CheckoutPage.tsx
        - OrderSummary.tsx
        - PaymentForm.tsx
        - types.ts
      - **comparison/**
        - CBHPMComparisonTable.tsx
        - CBHPMComparisonTableFilters.tsx
        - CBHPMComparisonTabs.tsx
        - CBHPMSummaryCards.tsx
        - ComparisonHeader.tsx
        - ComparisonTable.tsx
        - DemonstrativeInfo.tsx
        - ProceduresTable.tsx
        - SummaryCards.tsx
      - **contestation/**
        - ContestationDialog.tsx
      - **dashboard/**
        - AnalyticsChart.tsx
        - DashboardAlert.tsx
        - DashboardHeader.tsx
        - DashboardLayout.tsx
        - DashboardOverview.tsx
        - RecentActivities.tsx
        - StatusCards.tsx
        - **tabs/**
          - DashboardTabs.tsx
          - GlosasTab.tsx
          - PaymentStatementsTab.tsx
          - PaymentsTab.tsx
          - ProceduresTab.tsx
          - **columns/**
            - paymentStatementsColumns.tsx
            - proceduresColumns.tsx
          - **grids/**
            - PaymentStatementsGrid.tsx
            - ProceduresGrid.tsx
      - **guides/**
        - GuideDetailDialog.tsx
      - **help/**
        - FAQSection.tsx
        - GuidesList.tsx
        - HelpContent.tsx
        - SearchBar.tsx
        - SearchResults.tsx
        - VideosList.tsx
      - **history/**
        - HistorySearch.tsx
        - HistoryTable.tsx
        - StatusBadge.tsx
        - data.ts
      - **landing/**
        - BenefitsSection.tsx
        - DemoSection.tsx
        - HeroSection.tsx
        - PricingSection.tsx
        - ProductFeatures.tsx
      - **layout/**
        - AuthenticatedLayout.tsx
        - Footer.tsx
        - MainLayout.tsx
        - PageHeader.tsx
        - PublicLayout.tsx
      - **navbar/**
        - GuestNavigation.tsx
        - HelpMenu.tsx
        - MobileMenu.tsx
        - NotificationsMenu.tsx
        - UserMenu.tsx
        - UserNavigation.tsx
      - **notifications/**
        - EmptyNotifications.tsx
        - NotificationCard.tsx
        - NotificationsList.tsx
      - **onboarding/**
        - GuidedTour.tsx
        - TourNavigation.tsx
        - tourSteps.ts
      - **pricing/**
        - PricingFAQ.tsx
        - PricingHeader.tsx
        - PricingPlan.tsx
        - planData.ts
        - types.ts
      - **profile/**
        - ActivitySummary.tsx
        - ProfileContainer.tsx
        - ProfileHeader.tsx
        - ProfileTabs.tsx
        - SubscriptionCard.tsx
        - **avatar/**
          - ProfileAvatar.tsx
        - **form/**
          - ProfileForm.tsx
        - **form-fields/**
          - BasicInfoFields.tsx
          - ProfessionalFields.tsx
        - **image/**
          - ProfileImageUpload.tsx
        - **security/**
          - SecurityForm.tsx
        - **stats/**
          - ProfileStats.tsx
        - **tabs/**
          - NotificationsTab.tsx
      - **reports/**
        - HospitalsTable.tsx
        - OverviewCharts.tsx
        - ReportsHeader.tsx
        - StatusCardsSection.tsx
        - data.ts
      - **settings/**
        - NotificationsSettings.tsx
        - ReferenceTablesSettings.tsx
        - **notifications/**
          - EmailSettings.tsx
          - NotificationSettings.tsx
          - SmsSettings.tsx
          - types.ts
        - **reference-tables/**
          - RolesList.tsx
          - TablesList.tsx
          - types.ts
      - **sidebar/**
        - AppSidebar.tsx
      - **sidenav/**
        - AccountSection.tsx
        - FooterSection.tsx
        - HelpSection.tsx
        - MainNavigation.tsx
        - NotificationsSection.tsx
        - ProfileSection.tsx
        - **__tests__/**
          - AccountSection.test.tsx
          - FooterSection.test.tsx
          - HelpSection.test.tsx
          - MainNavigation.test.tsx
          - NotificationsSection.test.tsx
          - ProfileSection.test.tsx
          - SideNav.test.tsx
      - **support/**
        - NewTicketForm.tsx
        - SupportLayout.tsx
        - TicketDetail.tsx
        - TicketList.tsx
        - helpers.ts
        - types.ts
      - **ui/**
        - accordion.tsx
        - alert-dialog-provider.tsx
        - alert-dialog.tsx
        - alert.tsx
        - aspect-ratio.tsx
        - avatar.tsx
        - badge.tsx
        - breadcrumb.tsx
        - button.tsx
        - calendar.tsx
        - card.tsx
        - carousel.tsx
        - chart.tsx
        - checkbox.tsx
        - collapsible.tsx
        - command.tsx
        - context-menu.tsx
        - data-grid.tsx
        - date-range-picker.tsx
        - dialog.tsx
        - drawer.tsx
        - dropdown-menu.tsx
        - form.tsx
        - hover-card.tsx
        - input-otp.tsx
        - input.tsx
        - label.tsx
        - loading-spinner.tsx
        - menubar.tsx
        - navigation-menu.tsx
        - pagination.tsx
        - popover.tsx
        - progress.tsx
        - radio-group.tsx
        - resizable.tsx
        - scroll-area.tsx
        - select.tsx
        - separator.tsx
        - sheet.tsx
        - sidebar.tsx
        - skeleton.tsx
        - slider.tsx
        - sonner.tsx
        - switch.tsx
        - table.tsx
        - tabs.tsx
        - textarea.tsx
        - toast.tsx
        - toaster.tsx
        - toggle-group.tsx
        - toggle.tsx
        - tooltip.tsx
        - use-toast.ts
      - **unpaid-procedures/**
        - ResourceDialog.tsx
        - UnpaidProcedureDetailDialog.tsx
      - **upload/**
        - FileDropZone.tsx
        - FileList.tsx
        - ProcessingSection.tsx
        - UploadActionButtons.tsx
        - UploadAlerts.tsx
        - UploadContextAlerts.tsx
        - UploadDropzoneArea.tsx
        - UploadError.tsx
        - UploadInstructions.tsx
        - UploadProgress.tsx
        - UploadSection.tsx
        - UploadStatus.tsx
        - UploadSuccess.tsx
        - **__tests__/**
          - UploadSection.test.tsx
    - **contexts/**
      - AuthContext.ts
      - NotificationContext.tsx
      - ThemeProvider.tsx
      - **auth/**
        - AuthContext.tsx
        - authUtils.ts
        - types.ts
        - useAuthActions.ts
        - useAuthState.ts
      - index.ts
    - **data/**
      - cbhpmData.ts
      - helpFAQs.ts
      - helpGuides.ts
      - referenceTables.ts
    - **docs/**
      - GoogleAuthSetup.md
    - **hooks/**
      - **profile/**
        - use-profile-avatar.ts
        - use-profile-data.ts
        - use-profile-notifications.ts
        - use-profile-security.ts
      - **upload/**
        - useFileList.ts
        - useFileUploadService.ts
        - useProcessingStatus.ts
        - useUploadProcessing.ts
      - use-dashboard-stats.ts
      - use-mobile.ts
      - use-mobile.tsx
      - use-onboarding.ts
      - use-profile-avatar.ts
      - use-profile-form.ts
      - use-profile.ts
      - use-theme.tsx
      - use-toast.ts
      - use-trial-status.ts
      - useComparisonData.ts
      - useDemonstrativoSelection.ts
      - useFileUpload.ts
      - useTickets.ts
    - index.css
    - **integrations/**
      - **supabase/**
        - client.ts
        - types.ts
    - **layout/**
      - PublicLayout.tsx
    - **lib/**
      - featureFlags.ts
      - utils.ts
    - main.tsx
    - **pages/**
      - About.tsx
      - Analysis.tsx
      - AuthCallback.tsx
      - Checkout.tsx
      - CompareContracheque.tsx
      - Contact.tsx
      - Dashboard.tsx
      - Demonstratives.tsx
      - ForgotPassword.tsx
      - Glosas.tsx
      - Guides.tsx
      - Help.tsx
      - History.tsx
      - Home.tsx
      - HowItWorks.tsx
      - Index.tsx
      - LockScreen.tsx
      - Login.tsx
      - NewAudit.tsx
      - NotFound.tsx
      - Notifications.tsx
      - Pricing.tsx
      - Privacy.tsx
      - Profile.tsx
      - PublicHelp.tsx
      - ReferenceTables.tsx
      - Register.tsx
      - Reports.tsx
      - ResetPassword.tsx
      - Settings.tsx
      - Support.tsx
      - Terms.tsx
      - UnpaidProcedures.tsx
      - UpdatePassword.tsx
      - Uploads.tsx
      - Welcome.tsx
    - **services/**
      - **analysis/**
        - getAnalysisService.ts
        - historyService.ts
        - saveAnalysisService.ts
      - analysisService.ts
      - contestationService.ts
      - databaseService.ts
      - **export/**
        - README-pt.md
        - README.md
        - excelExport.ts
        - fhirExport.ts
        - index.ts
        - tissExport.ts
        - types.ts
      - exportService.ts
      - fileUploadEdge.ts
      - fileUploadService.ts
      - **history/**
        - analysisDetails.ts
        - fetchHistory.ts
        - index.ts
        - search.ts
        - statusUpdate.ts
      - historyService.ts
      - messageUtils.ts
      - mockData.ts
      - processingService.ts
      - **reports/**
        - hospitalService.ts
        - index.ts
        - monthlyService.ts
        - totalsService.ts
      - simulatedUploadService.ts
      - unpaidProceduresService.ts
      - **upload/**
        - analysisService.ts
        - edgeService.ts
        - index.ts
        - storageService.ts
      - uploadModeUtils.ts
    - **test/**
      - setup.ts
      - **smoke/**
        - auth.test.ts
        - features.test.ts
        - health.test.ts
        - history.test.ts
        - rls.test.ts
        - upload.test.ts
      - **unit/**
        - analysisHelpers.test.ts
        - helpHelpers.test.ts
        - **history/**
          - analysisDetails.test.ts
          - fetchHistory.test.ts
          - search.test.ts
          - statusUpdate.test.ts
        - procedureHelpers.test.ts
        - profileHelpers.test.ts
        - queryHelpers.test.ts
      - vitest-env.d.ts
    - test-setup.ts
    - **types/**
      - help.ts
      - index.ts
      - jest-dom.d.ts
      - medical.ts
      - upload.ts
    - **utils/**
      - alertUtils.ts
      - comparisonFallback.ts
      - comparisonSupabase.ts
      - fileValidation.ts
      - format.ts
      - formatters.ts
      - **supabase/**
        - analysisHelpers.ts
        - helpHelpers.ts
        - index.ts
        - procedureHelpers.ts
        - profileHelpers.ts
        - queryHelpers.ts
        - supabaseHelpers.ts
      - supabaseHelpers.ts
      - uploadUtils.ts
    - vite-env.d.ts
  - **supabase/**
    - config.toml
    - **functions/**
      - **health/**
        - index.ts
      - **process-analysis/**
        - index.ts
    - import_map.json
    - rls.sql
  - tailwind.config.ts
  - tsconfig.app.json
  - tsconfig.json
  - tsconfig.node.json
  - tsconfig.strict.json
  - vite.config.ts
  - vitest.config.ts
- token.json
- token_crm_inexistente.json
- token_invalido.json
- token_novo_medico.json
- token_response.json
- tsconfig.json
- upload_demo_novo_medico.json
- **uploads/**
  - 01cea132-a1a4-4034-a009-bc9449ac4d84_Demonstrativo-outubro_2024.pdf
  - 04384285-82e7-4b63-9072-127c1788f30a_Demonstrativo-outubro_2024.pdf
  - 0468152f-e023-4b59-ac8c-540c96b5ec57_Demonstrativo-outubro_2024.pdf
  - 05d8ffa3-c4f9-482f-be23-0aeca10fecc4_Demonstrativo-abril_2024.pdf
  - 06a67eff-ba22-442c-be5e-ffcd2e53a03b_Demonstrativo-outubro_2024.pdf
  - 0951197270cc271b516284607a9cdf98
  - 0a5292e8-70dd-4a49-9b85-6ba3f05af445_Demonstrativo-outubro_2024.pdf
  - 0b912511-3399-43a5-9c3c-781094c30ba2_Demonstrativo-abril_2024.pdf
  - 0f90f80c-8baf-4960-9e27-38ec7be25656_Demonstrativo-outubro_2024.pdf
  - 11557371-3d0c-42a8-b07c-90b129843f83_Demonstrativo-abril_2024.pdf
  - 1319840a-5acc-42ca-a550-d7bb8d90b2cf_Demonstrativo-outubro_2024.pdf
  - 1469a4a5-f272-4bb0-a40f-0841b4e2ecbb_Demonstrativo-outubro_2024.pdf
  - 175d6bde-88fa-4916-8196-46de71cf1192_demonstrativo.pdf
  - 175d6bde-88fa-4916-8196-46de71cf1192_guia_0.pdf
  - 175d6bde-88fa-4916-8196-46de71cf1192_guia_1.pdf
  - 175d6bde-88fa-4916-8196-46de71cf1192_guia_2.pdf
  - 1864ccf6-5a66-48ee-826b-fc148ced1b66_nubia_katia.pdf
  - 1c57b87f-1502-4301-86f0-b33663d546dc_Demonstrativo-abril_2024.pdf
  - 1d41db6e-c20a-48d5-9028-0d57f81394f4_Demonstrativo-outubro_2024.pdf
  - 1d5c2a1f-0ec3-4a0e-b87f-f81dfaa4e2b5_Demonstrativo-abril_2024.pdf
  - 1e004a6c-de09-4223-951e-cde1df099fd5_demonstrativo.pdf
  - 1e004a6c-de09-4223-951e-cde1df099fd5_guia_0.pdf
  - 25dfb1e1-e9b9-45d5-a6fe-709686102fd6_Demonstrativo-abril_2024.pdf
  - 27feb4ee-3e17-403f-ad37-bc968c53d6ed_Demonstrativo-abril_2024.pdf
  - 306404ea-d208-4cc4-9b52-e62d46edff3c_Demonstrativo-outubro_2024.pdf
  - 316d0098-b4aa-4bd9-8425-57539e486971_Demonstrativo-outubro_2024.pdf
  - 33cca567-0373-4300-bef2-b2501dc6b8c3_demonstrativo.pdf
  - 33cca567-0373-4300-bef2-b2501dc6b8c3_guia_0.pdf
  - 34640d09-1c75-4747-8b05-c67c4657a1b5_Demonstrativo-abril_2024.pdf
  - 34c904ec-86b3-4fc0-9cd8-03476754ac96_Demonstrativo-abril_2024.pdf
  - 3a41b306-5bf2-40ed-a612-402639b0d51a_Demonstrativo-outubro_2024.pdf
  - 3d34040a-2fef-4f4c-85e3-e781eee47b4d_nubia_katia.pdf
  - 44489bcc-c0e3-470c-895f-9197706a7dcf_demonstrativo.pdf
  - 44489bcc-c0e3-470c-895f-9197706a7dcf_guia_0.pdf
  - 44489bcc-c0e3-470c-895f-9197706a7dcf_guia_1.pdf
  - 44489bcc-c0e3-470c-895f-9197706a7dcf_guia_2.pdf
  - 44489bcc-c0e3-470c-895f-9197706a7dcf_guia_3.pdf
  - 44cb0b4b-1d59-418a-b441-0448d6a2f08c_Demonstrativo-outubro_2024.pdf
  - 45abde74-fc2c-4273-bb47-b0c4d116751a_Demonstrativo-outubro_2024.pdf
  - 47e09494-7894-4bd6-bb85-aa538cfa4ee0_Demonstrativo-outubro_2024.pdf
  - 4865d8f5-fe34-4708-a00f-a0506197a586_Demonstrativo-outubro_2024.pdf
  - 4d0a5b29-0629-4e45-b191-418a1529d5bd_Demonstrativo-abril_2024.pdf
  - 4e8d414e-0a2f-4da6-b424-6535a137bf3d_Demonstrativo-abril_2024.pdf
  - 542df0bd-4db3-487d-8a89-8c4fbdb2db9a_Demonstrativo-abril_2024.pdf
  - 54ced4f7-3182-4869-b0a4-535aec0a2809_Demonstrativo-outubro_2024.pdf
  - 5603bb9c-4a33-4ca2-99c9-2fb2cccea123_Demonstrativo-outubro_2024.pdf
  - 57417b00-e05d-40c4-8695-d4e083f654a0_demonstrativo.pdf
  - 57417b00-e05d-40c4-8695-d4e083f654a0_guia_0.pdf
  - 5b3a2722-d422-4086-8676-8bff9a99f263_Demonstrativo-abril_2024.pdf
  - 5e0d5cb9-14db-4b2a-a5f3-18c7509715c2_Demonstrativo-abril_2024.pdf
  - 5ecce833-9e60-4558-a7a2-10600da2d0a4_Demonstrativo-outubro_2024.pdf
  - 6094c172-fd91-4b11-94b1-90ddd82ac94f_Demonstrativo-outubro_2024.pdf
  - 6fc02663-55cc-4799-8d10-70772e9fcd5f_Demonstrativo-outubro_2024.pdf
  - 774278eb-5094-496b-8fba-3f35a1a6607a_Demonstrativo-outubro_2024.pdf
  - 788b743d-050f-4b62-b719-a012b89cd47e_Demonstrativo-outubro_2024.pdf
  - 7a50ef99-b934-41d1-b51c-f7b93a029b24_Demonstrativo-abril_2024.pdf
  - 7cf47f47-e32d-459b-83a1-a28b56976bb4_Demonstrativo-outubro_2024.pdf
  - 80ff3f5e-7107-40c1-8d98-9ac79ee37081_Demonstrativo-outubro_2024.pdf
  - 8a259c72-a13e-42bd-bb6b-856dfda97b20_nubia_katia.pdf
  - 8d42cfeb-7344-4366-b30a-b5c57af9a62e_Demonstrativo-abril_2024.pdf
  - 922ca515-77d8-4809-bd22-aaeb191c2d79_Demonstrativo-abril_2024.pdf
  - 92ded9b2-f302-42aa-a98f-380144fee149_Demonstrativo-abril_2024.pdf
  - 991a6532-be68-4dbb-a64b-720aebc99c6d_Demonstrativo-outubro_2024.pdf
  - 99c66a25-1401-42de-99b9-e05e8c707938_Demonstrativo-outubro_2024.pdf
  - 9cd28ef7-c555-42f5-87fc-c6e5f1ac05b6_Demonstrativo-abril_2024.pdf
  - a4b421ce-f20d-464e-9e6e-5327b81a0fff_Demonstrativo-outubro_2024.pdf
  - a5bd29a5-186e-435d-9e45-47f37fdfff75_Demonstrativo-abril_2024.pdf
  - b1562186-2c0a-404b-80d7-df0553b41455_Demonstrativo-outubro_2024.pdf
  - b25f6e5c-c36f-48ef-aaa4-c0facb174c63_Demonstrativo-outubro_2024.pdf
  - b6bbbfb0-2912-49f9-a527-357af009f80f_Demonstrativo-outubro_2024.pdf
  - b8e90d07-64f6-4846-abb2-37961145cac6_Demonstrativo-abril_2024.pdf
  - ba4d59f3-163f-46bd-a927-ef7b65b9225e_Demonstrativo-outubro_2024.pdf
  - bc701bfb-010f-4159-b8dd-fdac6d49f941_Demonstrativo-outubro_2024.pdf
  - bf14a491-9688-4ae7-ab85-55c2ae7a8a69_demonstrativo.pdf
  - bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_0.pdf
  - bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_1.pdf
  - bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_2.pdf
  - bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_3.pdf
  - c4d7648c-522f-4866-b2ee-1b529c29948e_demonstrativo.pdf
  - c4d7648c-522f-4866-b2ee-1b529c29948e_guia_0.pdf
  - c4d7648c-522f-4866-b2ee-1b529c29948e_guia_1.pdf
  - c4d7648c-522f-4866-b2ee-1b529c29948e_guia_2.pdf
  - c4d7648c-522f-4866-b2ee-1b529c29948e_guia_3.pdf
  - c6fd80f2-b3cb-45ff-b639-25c5fe61d12f_Demonstrativo-outubro_2024.pdf
  - c722da8b-c5db-4024-850e-b40863b5aef2_Demonstrativo-abril_2024.pdf
  - c8249bbf-b7f0-4274-8bbf-ada09d605412_Demonstrativo-outubro_2024.pdf
  - c9af62be-6bf9-40db-90cc-9ab9e626ef2b_Demonstrativo-outubro_2024.pdf
  - cd110909-3782-473f-81d2-346886f8e00f_nubia_katia.pdf
  - d0a2012e-c301-48ae-b166-6121c62e04f0_Demonstrativo-outubro_2024.pdf
  - d1af3791-2c4b-4a4b-a654-7d15f61d569d_demonstrativo.pdf
  - d1af3791-2c4b-4a4b-a654-7d15f61d569d_guia_0.pdf
  - d6b165eb-d057-4065-9ab9-54ea32654bbd_Demonstrativo-outubro_2024.pdf
  - d8c8fc4b-9434-4812-9be2-eb4e73b297bb_Demonstrativo-abril_2024.pdf
  - dba7e475-4e68-481e-ae43-bf2d575a7d80_Demonstrativo-outubro_2024.pdf
  - demo_novo_medico.pdf
  - dfc2ac68-53d3-49d7-9380-e63542a0bcad_Demonstrativo-abril_2024.pdf
  - e1c93378-b6e4-4f88-96cf-b2406def1c13_Demonstrativo-abril_2024.pdf
  - e84f075cda76f4c0446feb560d4b2f31
  - e95d36d6-ced9-4acb-8029-cc36e38548d6_Demonstrativo-outubro_2024.pdf
  - ea548173-9f8e-4e7e-aafd-9ff6b25d8aa3_Demonstrativo-outubro_2024.pdf
  - f0ddb5a1-efd3-4d6f-a8ea-dab4b8a0bd38_Demonstrativo-outubro_2024.pdf
  - f1cfd48e-39f6-4a0e-a8c0-6f42e29f0fa1_Demonstrativo-outubro_2024.pdf
  - f4bd71ab-4f3a-406b-84f3-2cf6e9945b28_demonstrativo.pdf
  - f4bd71ab-4f3a-406b-84f3-2cf6e9945b28_guia_0.pdf
  - f578e452-2336-4ef9-965a-151404749516_Demonstrativo-abril_2024.pdf
  - f62a91be-05bf-4360-bd5d-f377a2292ad9_demo_novo_medico.pdf
  - f7c81d5e-7e49-4892-99d4-62a9bde39322_Demonstrativo-outubro_2024.pdf
  - fc712304-46f3-4828-a57f-8a21f71ae1a6_Demonstrativo-abril_2024.pdf
  - fe1c989f-70c6-4af7-a58c-b03811c4165c_Demonstrativo-outubro_2024.pdf
  - fee04a59-f032-4d05-a439-cc1167ed8633_Demonstrativo-abril_2024.pdf
  - noivana.pdf
- validate_response.json
- yarn.lock
